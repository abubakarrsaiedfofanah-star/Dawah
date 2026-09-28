-- Enables public donors to submit a pending donation from the Vercel site without an account.
-- The function accepts only donation fields, records a pending row, and blocks duplicate references.
-- Run once in Supabase SQL Editor after supabase_role_security.sql.

create or replace function public.dawah_submit_public_donation(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
    v_id uuid;
    v_amount numeric(12, 2);
    v_type text;
    v_method text;
    v_reference text;
    v_normalized_reference text;
    v_donor text;
    v_purpose text;
    v_appeal_id text;
    v_appeal_title text;
    v_anonymous boolean;
begin
    if jsonb_typeof(p_payload) is distinct from 'object' then
        raise exception 'Donation details are invalid';
    end if;

    begin
        v_amount := (p_payload ->> 'amount')::numeric;
    exception when invalid_text_representation or numeric_value_out_of_range then
        raise exception 'Enter a valid donation amount';
    end;
    if v_amount <= 0 or v_amount > 10000000 then
        raise exception 'Donation amount must be between KSh 1 and KSh 10,000,000';
    end if;

    v_type := left(trim(coalesce(p_payload ->> 'type', 'Donation')), 120);
    v_method := left(trim(coalesce(p_payload ->> 'paymentMethod', '')), 80);
    v_reference := left(trim(coalesce(p_payload ->> 'transactionRef', '')), 120);
    v_donor := left(coalesce(nullif(trim(p_payload ->> 'donor'), ''), 'Donor'), 100);
    v_purpose := left(trim(coalesce(p_payload ->> 'purpose', 'UMMA University Dawah Team donation')), 300);
    v_appeal_id := left(trim(coalesce(p_payload ->> 'appealId', '')), 120);
    v_appeal_title := left(trim(coalesce(p_payload ->> 'appealTitle', '')), 120);
    v_anonymous := coalesce((p_payload ->> 'anonymous')::boolean, false);

    if v_method not in ('M-Pesa STK Push', 'Bank Transfer', 'Normal Transfer Number', 'Cash Payment') then
        raise exception 'Choose one of the listed payment methods';
    end if;
    if v_method <> 'Cash Payment' and v_reference = '' then
        raise exception 'Enter the payment transaction reference';
    end if;

    v_normalized_reference := upper(regexp_replace(v_reference, '\s+', '', 'g'));
    if v_normalized_reference <> '' and v_method <> 'Cash Payment' then
        perform pg_advisory_xact_lock(hashtext(v_normalized_reference));
        if exists (
            select 1 from public.app_records r
            where r.collection in ('donations', 'payments')
              and upper(regexp_replace(coalesce(r.data ->> 'transactionRef', ''), '\s+', '', 'g')) = v_normalized_reference
        ) then
            raise exception 'This transaction reference is already recorded';
        end if;
    end if;

    insert into public.app_records (collection, data)
    values (
        'donations',
        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'type', v_type,
            'purpose', v_purpose,
            'amount', v_amount,
            'date', current_date::text,
            'paymentMethod', v_method,
            'transactionRef', v_reference,
            'status', 'Pending Approval',
            'anonymous', v_anonymous,
            'donor', case when v_anonymous then 'Anonymous' else v_donor end,
            'receiptNumber', '',
            'appealId', nullif(v_appeal_id, ''),
            'appealTitle', nullif(v_appeal_title, ''),
            'appealReference', nullif(v_appeal_id, ''),
            'ownerUid', auth.uid()::text,
            'createdAt', now()::text
        )
    ) returning id into v_id;

    return v_id;
end;
$$;

revoke all on function public.dawah_submit_public_donation(jsonb) from public;
grant execute on function public.dawah_submit_public_donation(jsonb) to anon, authenticated;

-- Treasurer and other finance officers need to publish approved receipt lookups.
drop policy if exists "Finance officers insert receipt verifications" on public.app_records;
drop policy if exists "Finance officers update receipt verifications" on public.app_records;
create policy "Finance officers insert receipt verifications"
    on public.app_records for insert
    to authenticated
    with check (
        collection = 'receiptVerifications'
        and (public.is_dawah_admin() or public.dawah_has_permission('manage_payments'))
    );
create policy "Finance officers update receipt verifications"
    on public.app_records for update
    to authenticated
    using (
        collection = 'receiptVerifications'
        and (public.is_dawah_admin() or public.dawah_has_permission('manage_payments'))
    )
    with check (
        collection = 'receiptVerifications'
        and (public.is_dawah_admin() or public.dawah_has_permission('manage_payments'))
    );
