-- Role-scoped Supabase RLS policies for the existing Dawah schema.
-- Run supabase_schema.sql first on a new project, then run this migration.
-- This migration is safe to re-run. It does not delete application data.

alter table public.app_stores enable row level security;
alter table public.app_records enable row level security;
alter table public.admin_roles enable row level security;
-- Admin access can be disabled by changing the role row status. Older main-admin
-- rows without a status remain active for backwards compatibility.
create or replace function public.is_dawah_admin(check_uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select exists (
        select 1
        from public.admin_roles
        where uid = check_uid
          and lower(replace(replace(trim(coalesce(data ->> 'status', 'active')), '-', '_'), ' ', '_'))
              not in ('inactive', 'suspended', 'disabled', 'revoked', 'pending', 'rejected')
          and (
              lower(coalesce(data ->> 'role', '')) in ('admin', 'main-admin', 'main admin', 'super-admin', 'super admin')
              or lower(coalesce(data ->> 'isMainAdmin', 'false')) = 'true'
          )
    );
$$;

create or replace function public.is_dawah_main_admin(check_uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select exists (
        select 1
        from public.admin_roles
        where uid = check_uid
          and lower(replace(replace(trim(coalesce(data ->> 'status', 'active')), '-', '_'), ' ', '_'))
              not in ('inactive', 'suspended', 'disabled', 'revoked', 'pending', 'rejected')
          and lower(coalesce(data ->> 'isMainAdmin', 'false')) = 'true'
    );
$$;

-- Public verification returns only the fields needed to validate a card.
create or replace function public.dawah_get_public_membership_card(lookup_card_id text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select jsonb_build_object(
        'cardId', card.data ->> 'cardId',
        'fullName', coalesce(card.data ->> 'fullName', card.data ->> 'name', card.data ->> 'username'),
        'username', card.data ->> 'username',
        'studentId', card.data ->> 'studentId',
        'course', card.data ->> 'course',
        'status', card.data ->> 'status',
        'paymentStatus', card.data ->> 'paymentStatus',
        'issuedAt', card.data ->> 'issuedAt',
        'expiresAt', card.data ->> 'expiresAt',
        'validityYears', card.data ->> 'validityYears',
        'receiptNumber', card.data ->> 'receiptNumber',
        'signatureName', coalesce(site.data -> 'settings' ->> 'finance_signature_name', site.data ->> 'finance_signature_name'),
        'signatureTitle', coalesce(site.data -> 'settings' ->> 'finance_signature_title', site.data ->> 'finance_signature_title'),
        'signatureImage', coalesce(site.data -> 'settings' ->> 'finance_signature_image', site.data ->> 'finance_signature_image')
    )
    from public.app_records card
    left join public.app_stores site on site.key = 'siteSettings'
    where card.collection = 'membershipCards'
      and card.data ->> 'cardId' = lookup_card_id
      and lower(coalesce(card.data ->> 'status', '')) = 'active'
      and lower(coalesce(card.data ->> 'paymentStatus', '')) = 'paid'
      and exists (
          select 1
          from public.app_records payment
          where payment.collection = 'payments'
            and replace(lower(coalesce(payment.data ->> 'type', payment.data ->> 'payment_type', '')), ' ', '') = 'membershipdues'
            and lower(coalesce(payment.data ->> 'status', '')) = 'completed'
            and coalesce(payment.data ->> 'id', payment.id::text) = coalesce(card.data ->> 'paymentId', '')
      )
    order by card.updated_at desc, card.created_at desc
    limit 1;
$$;
revoke all on function public.dawah_get_public_membership_card(text) from public;
grant execute on function public.dawah_get_public_membership_card(text) to anon, authenticated;

-- Receipt QR lookups expose only a single approved receipt's public fields.
create or replace function public.dawah_get_public_receipt(lookup_receipt_number text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select jsonb_build_object(
        'receiptNumber', receipt.data ->> 'receiptNumber',
        'kind', receipt.data ->> 'kind',
        'amount', receipt.data ->> 'amount',
        'status', receipt.data ->> 'status',
        'type', receipt.data ->> 'type',
        'name', receipt.data ->> 'name',
        'method', receipt.data ->> 'method',
        'transactionRef', receipt.data ->> 'transactionRef',
        'approvedBy', receipt.data ->> 'approvedBy',
        'approvedAt', receipt.data ->> 'approvedAt',
        'createdAt', receipt.data ->> 'createdAt',
        'updatedAt', receipt.data ->> 'updatedAt',
        'signatureName', coalesce(site.data -> 'settings' ->> 'finance_signature_name', site.data ->> 'finance_signature_name'),
        'signatureTitle', coalesce(site.data -> 'settings' ->> 'finance_signature_title', site.data ->> 'finance_signature_title'),
        'signatureImage', coalesce(site.data -> 'settings' ->> 'finance_signature_image', site.data ->> 'finance_signature_image')
    )
    from public.app_records receipt
    left join public.app_stores site on site.key = 'siteSettings'
    where receipt.collection = 'receiptVerifications'
      and lower(receipt.data ->> 'receiptNumber') = lower(lookup_receipt_number)
      and lower(coalesce(receipt.data ->> 'status', '')) in ('completed', 'reversed')
      and exists (
          select 1
          from public.app_records source
          where source.collection = case when lower(coalesce(receipt.data ->> 'kind', '')) = 'donation' then 'donations' else 'payments' end
            and lower(coalesce(source.data ->> 'receiptNumber', source.data ->> 'receipt_number', ''))
                = lower(coalesce(receipt.data ->> 'receiptNumber', ''))
            and lower(coalesce(source.data ->> 'status', '')) = lower(coalesce(receipt.data ->> 'status', ''))
            and lower(coalesce(source.data ->> 'status', '')) in ('completed', 'reversed')
            and coalesce(source.data ->> 'amount', '') ~ '^[0-9]+([.][0-9]{1,2})?$'
            and coalesce(receipt.data ->> 'amount', '') ~ '^[0-9]+([.][0-9]{1,2})?$'
            and (source.data ->> 'amount')::numeric = (receipt.data ->> 'amount')::numeric
      )
    order by receipt.updated_at desc, receipt.created_at desc
    limit 1;
$$;
revoke all on function public.dawah_get_public_receipt(text) from public;
grant execute on function public.dawah_get_public_receipt(text) to anon, authenticated;

-- Only the main admin may set or change the official Imam signature.
create or replace function public.protect_dawah_finance_signature()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    previous_settings jsonb := '{}'::jsonb;
    next_settings jsonb := '{}'::jsonb;
    signature_changed boolean := false;
begin
    if new.key <> 'siteSettings' then
        return new;
    end if;

    next_settings := coalesce(new.data -> 'settings', new.data, '{}'::jsonb);
    if tg_op = 'UPDATE' then
        previous_settings := coalesce(old.data -> 'settings', old.data, '{}'::jsonb);
        signature_changed :=
            coalesce(next_settings ->> 'finance_signature_name', '') is distinct from coalesce(previous_settings ->> 'finance_signature_name', '')
            or coalesce(next_settings ->> 'finance_signature_title', '') is distinct from coalesce(previous_settings ->> 'finance_signature_title', '')
            or coalesce(next_settings ->> 'finance_signature_image', '') is distinct from coalesce(previous_settings ->> 'finance_signature_image', '');
    else
        signature_changed :=
            coalesce(next_settings ->> 'finance_signature_name', '') <> ''
            or coalesce(next_settings ->> 'finance_signature_title', '') <> ''
            or coalesce(next_settings ->> 'finance_signature_image', '') <> '';
    end if;

    if signature_changed and not public.is_dawah_main_admin(auth.uid()) then
        raise exception 'Only the main admin can change the official Imam signature';
    end if;
    return new;
end;
$$;
revoke all on function public.protect_dawah_finance_signature() from public;
drop trigger if exists protect_dawah_finance_signature_trigger on public.app_stores;
create trigger protect_dawah_finance_signature_trigger
    before insert or update on public.app_stores
    for each row execute function public.protect_dawah_finance_signature();

create or replace function public.dawah_has_permission(check_permission text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    member_role text;
    member_status text;
    permission_override jsonb;
begin
    if auth.uid() is null or check_permission is null then
        return false;
    end if;

    if public.is_dawah_admin() then
        return true;
    end if;

    select
        lower(replace(replace(trim(coalesce(data ->> 'role', 'student')), '-', '_'), ' ', '_')),
        lower(trim(coalesce(data ->> 'status', '')))
    into member_role, member_status
    from public.app_records
    where collection = 'members'
      and (
          coalesce(data ->> 'authUid', '') = auth.uid()::text
          or coalesce(data ->> 'uid', '') = auth.uid()::text
          or coalesce(data ->> 'ownerUid', '') = auth.uid()::text
          or (
              coalesce(auth.jwt() ->> 'email', '') <> ''
              and (
                  lower(coalesce(data ->> 'authEmail', '')) = lower(auth.jwt() ->> 'email')
                  or lower(coalesce(data ->> 'ownerEmail', '')) = lower(auth.jwt() ->> 'email')
                  or lower(coalesce(data ->> 'email', '')) = lower(auth.jwt() ->> 'email')
              )
          )
      )
    order by updated_at desc, created_at desc
    limit 1;

    if member_role is null or member_status <> 'active' then
        return false;
    end if;

    select overrides.item
    into permission_override
    from public.app_stores store
    cross join lateral jsonb_array_elements(
        case
            when jsonb_typeof(store.data -> 'items') = 'array' then store.data -> 'items'
            else '[]'::jsonb
        end
    ) as overrides(item)
    where store.key = 'rolePermissionOverrides'
      and lower(replace(replace(trim(coalesce(overrides.item ->> 'role', '')), '-', '_'), ' ', '_')) = member_role
    limit 1;

    if found then
        return jsonb_typeof(permission_override -> 'permissions') = 'array'
            and (permission_override -> 'permissions') ? check_permission;
    end if;

    if member_role in ('student', 'chairlady', 'vice_chairlady_1', 'vice_chairlady_2',
                       'secretary', 'vice_secretary', 'treasurer', 'vice_treasurer', 'media', 'organizer')
       and check_permission = any(array[
           'view_profile', 'view_membership', 'register_events', 'view_prayer_times',
           'view_announcements', 'view_resources', 'welfare_request', 'view_payments',
           'view_donations', 'register_volunteer'
       ]) then
        return true;
    end if;

    if member_role in ('chairlady', 'vice_chairlady_1', 'vice_chairlady_2')
       and check_permission in ('manage_welfare', 'view_reports') then
        return true;
    end if;

    if member_role in ('secretary', 'vice_secretary')
       and check_permission in ('manage_members', 'view_reports', 'generate_reports', 'create_announcements') then
        return true;
    end if;

    if member_role in ('treasurer', 'vice_treasurer')
       and check_permission in ('manage_payments', 'view_reports', 'generate_reports') then
        return true;
    end if;

    if member_role = 'media' and check_permission in ('manage_gallery', 'manage_contact') then
        return true;
    end if;

    if member_role = 'organizer' and check_permission in ('manage_events', 'manage_activities') then
        return true;
    end if;

    if member_role = 'amir_director'
       and check_permission in ('view_profile', 'view_prayer_times', 'view_announcements', 'view_resources',
                                'manage_prayer_times', 'manage_lectures', 'manage_hadiths') then
        return true;
    end if;

    if member_role = 'executive'
       and check_permission in (
           'view_profile', 'view_membership', 'register_events', 'view_prayer_times',
           'view_announcements', 'view_resources', 'welfare_request', 'view_payments',
           'view_donations', 'register_volunteer', 'manage_members', 'manage_events',
           'manage_activities', 'manage_welfare', 'manage_gallery', 'manage_contact',
           'manage_payments', 'manage_prayer_times', 'manage_lectures', 'manage_hadiths',
           'view_reports', 'generate_reports', 'create_announcements', 'manage_leadership'
       ) then
        return true;
    end if;

    return false;
end;
$$;

revoke all on function public.dawah_has_permission(text) from public;
grant execute on function public.dawah_has_permission(text) to authenticated;

create or replace function public.dawah_receipt_matches_verified_transaction(receipt jsonb)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
    source_collection text;
begin
    source_collection := case when lower(coalesce(receipt ->> 'kind', '')) = 'donation' then 'donations' else 'payments' end;
    return exists (
        select 1
        from public.app_records source
        where source.collection = source_collection
          and lower(coalesce(source.data ->> 'receiptNumber', source.data ->> 'receipt_number', ''))
              = lower(coalesce(receipt ->> 'receiptNumber', ''))
          and lower(coalesce(source.data ->> 'status', '')) = lower(coalesce(receipt ->> 'status', ''))
          and lower(coalesce(source.data ->> 'status', '')) in ('completed', 'reversed')
          and case
              when coalesce(source.data ->> 'amount', '') ~ '^[0-9]+([.][0-9]{1,2})?$'
               and coalesce(receipt ->> 'amount', '') ~ '^[0-9]+([.][0-9]{1,2})?$'
              then (source.data ->> 'amount')::numeric = (receipt ->> 'amount')::numeric
              else false
          end
    );
end;
$$;
revoke all on function public.dawah_receipt_matches_verified_transaction(jsonb) from public;

-- Officers can read only the records covered by their approved role.
drop policy if exists "Authenticated users can read app records" on public.app_records;
drop policy if exists "Authenticated users can write app records" on public.app_records;
drop policy if exists "Public users can verify receipts and members" on public.app_records;
drop policy if exists "Users read owned records and admins read all" on public.app_records;
drop policy if exists "Users create owned records and admins create all" on public.app_records;
drop policy if exists "Admins delete app records" on public.app_records;
drop policy if exists "Users and assigned officers read permitted records" on public.app_records;
drop policy if exists "Users and assigned officers update permitted records" on public.app_records;
create policy "Users and assigned officers read permitted records"
    on public.app_records for select
    to authenticated
    using (
        public.is_dawah_admin()
        or public.dawah_record_is_owned(data)
        or collection = 'memberVerifications'
        or (collection = 'receiptVerifications' and public.dawah_has_permission('manage_payments'))
        or (collection = 'membershipCards' and public.dawah_record_is_owned(data))
        or (collection = 'members' and public.dawah_has_permission('manage_members'))
        or (collection in ('payments', 'donations') and public.dawah_has_permission('manage_payments'))
        or (collection = 'welfareRequests' and public.dawah_has_permission('manage_welfare'))
        or (collection in ('eventRegistrations', 'volunteerRegistrations') and public.dawah_has_permission('manage_events'))
    );

create policy "Public users can verify receipts and members"
    on public.app_records for select
    to anon
    using (collection = 'memberVerifications');

-- Students may insert only their own account and transaction records. The trigger below
-- requires every requested officer role to remain pending until an admin approves it.
create policy "Users create owned records and admins create all"
    on public.app_records for insert
    to authenticated
    with check (
        public.is_dawah_admin()
        or (
            collection in (
                'members', 'payments', 'donations', 'welfareRequests',
                'eventRegistrations', 'volunteerRegistrations', 'auditLogs', 'membershipCards'
            )
            and public.dawah_record_is_owned(data)
            and lower(coalesce(data ->> 'role', 'student')) not in ('admin', 'main-admin', 'super-admin')
        )
        or (collection = 'receiptVerifications' and public.dawah_has_permission('manage_payments'))
    );

create policy "Admins delete app records"
    on public.app_records for delete
    to authenticated
    using (
        (collection = 'members' and public.is_dawah_main_admin())
        or (collection <> 'members' and public.is_dawah_admin())
    );

-- Allow approved officers to update only the record collections they manage.
drop policy if exists "Users update owned profiles and admins update all" on public.app_records;
create policy "Users and assigned officers update permitted records"
    on public.app_records for update
    to authenticated
    using (
        public.is_dawah_admin()
        or (collection = 'members' and public.dawah_record_is_owned(data))
        or (collection = 'members' and public.dawah_has_permission('manage_members'))
        or (collection in ('payments', 'donations') and public.dawah_has_permission('manage_payments'))
        or (collection = 'receiptVerifications' and public.dawah_has_permission('manage_payments'))
        or (collection = 'welfareRequests' and public.dawah_has_permission('manage_welfare'))
        or (collection in ('eventRegistrations', 'volunteerRegistrations') and public.dawah_has_permission('manage_events'))
    )
    with check (
        public.is_dawah_admin()
        or (collection = 'members' and public.dawah_record_is_owned(data))
        or (collection = 'members' and public.dawah_has_permission('manage_members'))
        or (collection in ('payments', 'donations') and public.dawah_has_permission('manage_payments'))
        or (collection = 'receiptVerifications' and public.dawah_has_permission('manage_payments'))
        or (collection = 'welfareRequests' and public.dawah_has_permission('manage_welfare'))
        or (collection in ('eventRegistrations', 'volunteerRegistrations') and public.dawah_has_permission('manage_events'))
    );

-- Store keys remain isolated by role; unrelated settings and permission assignments stay admin-only.
drop policy if exists "Authenticated users can read app stores" on public.app_stores;
drop policy if exists "Public users can read app stores" on public.app_stores;
drop policy if exists "Authenticated users can write app stores" on public.app_stores;
drop policy if exists "Authenticated users can read allowed app stores" on public.app_stores;
drop policy if exists "Admins can write app stores" on public.app_stores;
drop policy if exists "Admins and assigned officers write permitted app stores" on public.app_stores;
create policy "Authenticated users can read allowed app stores"
    on public.app_stores for select
    to authenticated
    using (
        public.is_dawah_admin()
        or key in (
            'adminAnnouncements', 'adminEvents', 'adminPrayerTimes', 'adminResources',
            'adminHadiths', 'adminReligiousActivities', 'volunteerOpportunities',
            'publicLeaders', 'galleryItems', 'siteSettings', 'rolePermissionOverrides'
        )
    );
create policy "Public users can read app stores"
    on public.app_stores for select
    to anon
    using (key in (
        'adminAnnouncements', 'adminEvents', 'adminPrayerTimes', 'adminResources',
        'adminHadiths', 'adminReligiousActivities', 'volunteerOpportunities',
        'publicLeaders', 'galleryItems', 'siteSettings'
    ));
create policy "Admins and assigned officers write permitted app stores"
    on public.app_stores for all
    to authenticated
    using (
        public.is_dawah_admin()
        or (key = 'adminAnnouncements' and public.dawah_has_permission('create_announcements'))
        or (key = 'adminEvents' and public.dawah_has_permission('manage_events'))
        or (key = 'adminPrayerTimes' and public.dawah_has_permission('manage_prayer_times'))
        or (key = 'adminHadiths' and public.dawah_has_permission('manage_hadiths'))
        or (key = 'adminReligiousActivities' and (public.dawah_has_permission('manage_activities') or public.dawah_has_permission('manage_prayer_times')))
        or (key = 'volunteerOpportunities' and public.dawah_has_permission('manage_events'))
        or (key = 'publicLeaders' and public.dawah_has_permission('manage_leadership'))
        or (key = 'galleryItems' and public.dawah_has_permission('manage_gallery'))
    )
    with check (
        public.is_dawah_admin()
        or (key = 'adminAnnouncements' and public.dawah_has_permission('create_announcements'))
        or (key = 'adminEvents' and public.dawah_has_permission('manage_events'))
        or (key = 'adminPrayerTimes' and public.dawah_has_permission('manage_prayer_times'))
        or (key = 'adminHadiths' and public.dawah_has_permission('manage_hadiths'))
        or (key = 'adminReligiousActivities' and (public.dawah_has_permission('manage_activities') or public.dawah_has_permission('manage_prayer_times')))
        or (key = 'volunteerOpportunities' and public.dawah_has_permission('manage_events'))
        or (key = 'publicLeaders' and public.dawah_has_permission('manage_leadership'))
        or (key = 'galleryItems' and public.dawah_has_permission('manage_gallery'))
    );

-- Remove legacy admin-role policies that allowed broad or first-user role assignment.
drop policy if exists "First authenticated user can create main admin role" on public.admin_roles;
drop policy if exists "Authenticated admins can manage admin roles" on public.admin_roles;
drop policy if exists "Authenticated users can read admin roles" on public.admin_roles;
drop policy if exists "Authenticated users can write admin roles" on public.admin_roles;
drop policy if exists "Users can read their own admin role" on public.admin_roles;
drop policy if exists "Main admin can write admin roles" on public.admin_roles;
create policy "Users can read their own admin role"
    on public.admin_roles for select
    to authenticated
    using (uid = auth.uid());
create policy "Authenticated users can read admin roles"
    on public.admin_roles for select
    to authenticated
    using (public.is_dawah_main_admin());
create policy "Main admin can write admin roles"
    on public.admin_roles for all
    to authenticated
    using (public.is_dawah_main_admin())
    with check (public.is_dawah_main_admin());

-- A new officer profile may request a role, but it cannot self-activate that role.
create or replace function public.protect_dawah_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    requested_role text;
    requested_status text;
    finance_status text;
    finance_amount text;
    finance_reference text;
    finance_fields_changed boolean := false;
    linked_paid_dues boolean := false;
begin
    if public.is_dawah_admin(auth.uid()) then
        return new;
    end if;

    requested_role := lower(replace(replace(trim(coalesce(new.data ->> 'role', 'student')), '-', '_'), ' ', '_'));
    requested_status := lower(trim(coalesce(new.data ->> 'status', '')));

    if tg_op = 'INSERT'
       and auth.uid() is not null
       and new.collection in (
           'members', 'payments', 'donations', 'welfareRequests',
           'eventRegistrations', 'volunteerRegistrations', 'auditLogs', 'membershipCards'
       )
       and (
           coalesce(new.data ->> 'ownerUid', '') not in ('', auth.uid()::text)
           or coalesce(new.data ->> 'authUid', '') not in ('', auth.uid()::text)
           or coalesce(new.data ->> 'uid', '') not in ('', auth.uid()::text)
       ) then
        raise exception 'Records must be created for the signed-in account';
    end if;

    if tg_op = 'UPDATE'
       and new.collection in (
           'members', 'payments', 'donations', 'welfareRequests',
           'eventRegistrations', 'volunteerRegistrations', 'auditLogs', 'membershipCards'
       )
       and (
           coalesce(new.data ->> 'ownerUid', '') is distinct from coalesce(old.data ->> 'ownerUid', '')
           or coalesce(new.data ->> 'authUid', '') is distinct from coalesce(old.data ->> 'authUid', '')
           or coalesce(new.data ->> 'uid', '') is distinct from coalesce(old.data ->> 'uid', '')
       ) then
        raise exception 'Record ownership cannot be changed';
    end if;

    if tg_op = 'INSERT' and new.collection = 'members'
       and (
           lower(coalesce(new.data ->> 'membershipCardPaymentStatus', '')) in ('paid', 'completed')
           or lower(coalesce(new.data ->> 'membershipPaymentStatus', '')) in ('paid', 'completed')
           or lower(coalesce(new.data ->> 'paymentStatus', '')) in ('paid', 'completed')
           or lower(coalesce(new.data ->> 'membershipCardRecordStatus', '')) = 'active'
           or coalesce(new.data ->> 'membershipCardId', '') <> ''
           or coalesce(new.data ->> 'membershipCardPaymentId', '') <> ''
           or coalesce(new.data ->> 'membershipCardReceiptNumber', '') <> ''
           or coalesce(new.data ->> 'membershipCardIssuedAt', '') <> ''
           or coalesce(new.data ->> 'membershipCardExpiresAt', '') <> ''
       ) then
        raise exception 'Payment and issued card status must be confirmed by the finance team';
    end if;

    if new.collection in ('payments', 'donations') then
        finance_status := lower(replace(replace(trim(coalesce(new.data ->> 'status', 'pending')), '-', '_'), ' ', '_'));
        finance_amount := trim(coalesce(new.data ->> 'amount', ''));
        finance_reference := lower(trim(coalesce(
            nullif(new.data ->> 'transactionRef', ''),
            nullif(new.data ->> 'transaction_id', ''),
            nullif(new.data ->> 'mpesaReceipt', ''),
            ''
        )));

        if case
            when finance_amount ~ '^[0-9]+([.][0-9]{1,2})?$' then finance_amount::numeric <= 0
            else true
        end then
            raise exception 'Payment amount must be a positive amount with no more than two decimal places';
        end if;

        if tg_op = 'INSERT' then
            if finance_status not in ('pending', 'pending_approval', 'pending_mpesa', 'pending_m_pesa', 'processing') then
                raise exception 'New payment and donation records must remain pending until verified';
            end if;
            if coalesce(
                    nullif(new.data ->> 'receiptNumber', ''), nullif(new.data ->> 'receipt_number', ''),
                    nullif(new.data ->> 'mpesaReceipt', ''), nullif(new.data ->> 'mpesa_receipt', ''), ''
               ) <> ''
               or coalesce(
                    nullif(new.data ->> 'approvedBy', ''), nullif(new.data ->> 'approvedAt', ''),
                    nullif(new.data ->> 'verifiedBy', ''), nullif(new.data ->> 'verifiedAt', ''), ''
               ) <> '' then
                raise exception 'Receipt and approval details can only be assigned after payment verification';
            end if;
            if finance_reference <> '' then
                perform pg_advisory_xact_lock(hashtextextended(finance_reference, 0));
                if exists (
                    select 1
                    from public.app_records existing
                    where existing.collection in ('payments', 'donations')
                      and lower(trim(coalesce(
                          nullif(existing.data ->> 'transactionRef', ''),
                          nullif(existing.data ->> 'transaction_id', ''),
                          nullif(existing.data ->> 'mpesaReceipt', ''),
                          ''
                      ))) = finance_reference
                ) then
                    raise exception 'This transaction reference has already been submitted';
                end if;
            end if;
        else
            finance_fields_changed :=
                coalesce(new.data ->> 'amount', '') is distinct from coalesce(old.data ->> 'amount', '')
                or coalesce(new.data ->> 'status', '') is distinct from coalesce(old.data ->> 'status', '')
                or coalesce(new.data ->> 'receiptNumber', new.data ->> 'receipt_number', '')
                    is distinct from coalesce(old.data ->> 'receiptNumber', old.data ->> 'receipt_number', '')
                or coalesce(new.data ->> 'approvedBy', '') is distinct from coalesce(old.data ->> 'approvedBy', '')
                or coalesce(new.data ->> 'approvedAt', '') is distinct from coalesce(old.data ->> 'approvedAt', '')
                or coalesce(new.data ->> 'verifiedBy', '') is distinct from coalesce(old.data ->> 'verifiedBy', '')
                or coalesce(new.data ->> 'verifiedAt', '') is distinct from coalesce(old.data ->> 'verifiedAt', '');

            if finance_fields_changed and not public.dawah_has_permission('manage_payments') then
                raise exception 'Only an authorized finance officer can verify or change payment records';
            end if;
            if lower(coalesce(old.data ->> 'status', '')) = 'completed'
               and finance_status <> 'completed'
               and not public.is_dawah_main_admin(auth.uid()) then
                raise exception 'Only the main admin can reverse a completed transaction';
            end if;
            if finance_status = 'completed'
               and coalesce(new.data ->> 'receiptNumber', new.data ->> 'receipt_number', '') = '' then
                raise exception 'A verified transaction must have a receipt number';
            end if;
        end if;
    end if;

    if tg_op = 'INSERT' then
        if new.collection = 'members' then
            if requested_role not in (
                'student', 'chairlady', 'vice_chairlady_1', 'vice_chairlady_2',
                'secretary', 'vice_secretary', 'treasurer', 'vice_treasurer',
                'media', 'organizer', 'amir_director', 'executive'
            ) then
                raise exception 'This account role cannot be self-assigned';
            end if;
            if requested_role <> 'student' and requested_status not in ('pending', 'pending approval') then
                raise exception 'Officer roles must be approved by the main admin';
            end if;
        end if;
        if new.collection = 'membershipCards' then
            select exists (
                select 1
                from public.app_records payment
                where payment.collection = 'payments'
                  and replace(lower(coalesce(payment.data ->> 'type', payment.data ->> 'payment_type', '')), ' ', '') = 'membershipdues'
                  and lower(coalesce(payment.data ->> 'status', '')) = 'completed'
                  and coalesce(payment.data ->> 'id', payment.id::text) = coalesce(new.data ->> 'paymentId', '')
                  and coalesce(payment.data ->> 'ownerUid', payment.data ->> 'authUid', payment.data ->> 'uid', '') = auth.uid()::text
            ) into linked_paid_dues;
            if not linked_paid_dues then
                raise exception 'A membership card requires a verified membership dues payment';
            end if;
            if coalesce(new.data ->> 'cardId', '') = '' then
                raise exception 'A membership card ID is required';
            end if;
            if lower(coalesce(new.data ->> 'status', '')) <> 'active'
               or lower(coalesce(new.data ->> 'paymentStatus', '')) <> 'paid' then
                raise exception 'Only paid, active membership cards can be issued';
            end if;
            if exists (
                select 1
                from public.app_records duplicate_card
                where duplicate_card.collection = 'membershipCards'
                  and duplicate_card.data ->> 'cardId' = new.data ->> 'cardId'
            ) then
                raise exception 'This membership card ID has already been issued';
            end if;
        end if;
        if new.collection = 'receiptVerifications'
           and (
               not public.dawah_has_permission('manage_payments')
               or not public.dawah_receipt_matches_verified_transaction(new.data)
           ) then
            raise exception 'A public receipt must match a completed or reversed finance record';
        end if;
        return new;
    end if;

    if new.collection = 'members' and (
        coalesce(new.data ->> 'role', '') is distinct from coalesce(old.data ->> 'role', '')
        or coalesce(new.data ->> 'status', '') is distinct from coalesce(old.data ->> 'status', '')
        or coalesce(new.data ->> 'accountStatus', '') is distinct from coalesce(old.data ->> 'accountStatus', '')
        or coalesce(new.data ->> 'membership_status', '') is distinct from coalesce(old.data ->> 'membership_status', '')
        or coalesce(new.data ->> 'approvedBy', '') is distinct from coalesce(old.data ->> 'approvedBy', '')
        or coalesce(new.data ->> 'approvedAt', '') is distinct from coalesce(old.data ->> 'approvedAt', '')
        or coalesce(new.data ->> 'roleAssignedBy', '') is distinct from coalesce(old.data ->> 'roleAssignedBy', '')
        or coalesce(new.data ->> 'roleAssignedAt', '') is distinct from coalesce(old.data ->> 'roleAssignedAt', '')
        or coalesce(new.data ->> 'rejectedRole', '') is distinct from coalesce(old.data ->> 'rejectedRole', '')
        or coalesce(new.data ->> 'authUid', '') is distinct from coalesce(old.data ->> 'authUid', '')
        or coalesce(new.data ->> 'uid', '') is distinct from coalesce(old.data ->> 'uid', '')
        or coalesce(new.data ->> 'ownerUid', '') is distinct from coalesce(old.data ->> 'ownerUid', '')
        or coalesce(new.data ->> 'authEmail', '') is distinct from coalesce(old.data ->> 'authEmail', '')
        or coalesce(new.data ->> 'ownerEmail', '') is distinct from coalesce(old.data ->> 'ownerEmail', '')
        or coalesce(new.data ->> 'membershipCardPaymentStatus', '') is distinct from coalesce(old.data ->> 'membershipCardPaymentStatus', '')
        or coalesce(new.data ->> 'membershipPaymentStatus', '') is distinct from coalesce(old.data ->> 'membershipPaymentStatus', '')
        or coalesce(new.data ->> 'paymentStatus', '') is distinct from coalesce(old.data ->> 'paymentStatus', '')
        or coalesce(new.data ->> 'membershipCardStatus', '') is distinct from coalesce(old.data ->> 'membershipCardStatus', '')
        or coalesce(new.data ->> 'membershipCardRecordStatus', '') is distinct from coalesce(old.data ->> 'membershipCardRecordStatus', '')
        or coalesce(new.data ->> 'membershipCardId', '') is distinct from coalesce(old.data ->> 'membershipCardId', '')
        or coalesce(new.data ->> 'membershipCardPaymentId', '') is distinct from coalesce(old.data ->> 'membershipCardPaymentId', '')
        or coalesce(new.data ->> 'membershipCardReceiptNumber', '') is distinct from coalesce(old.data ->> 'membershipCardReceiptNumber', '')
        or coalesce(new.data ->> 'membershipCardIssuedAt', '') is distinct from coalesce(old.data ->> 'membershipCardIssuedAt', '')
        or coalesce(new.data ->> 'membershipCardExpiresAt', '') is distinct from coalesce(old.data ->> 'membershipCardExpiresAt', '')
    ) then
        raise exception 'Officer roles, approval, identity, and issued membership card fields can only be changed by an admin';
    end if;

    if new.collection = 'membershipCards' then
        select exists (
            select 1
            from public.app_records payment
            where payment.collection = 'payments'
              and replace(lower(coalesce(payment.data ->> 'type', payment.data ->> 'payment_type', '')), ' ', '') = 'membershipdues'
              and lower(coalesce(payment.data ->> 'status', '')) = 'completed'
              and coalesce(payment.data ->> 'id', payment.id::text) = coalesce(new.data ->> 'paymentId', '')
              and coalesce(payment.data ->> 'ownerUid', payment.data ->> 'authUid', payment.data ->> 'uid', '') = auth.uid()::text
        ) into linked_paid_dues;
        if not linked_paid_dues then
            raise exception 'A membership card requires a verified membership dues payment';
        end if;
        if lower(coalesce(new.data ->> 'status', '')) <> 'active'
           or lower(coalesce(new.data ->> 'paymentStatus', '')) <> 'paid' then
            raise exception 'Only paid, active membership cards can be issued';
        end if;
    end if;

    if new.collection = 'receiptVerifications'
       and (
           not public.dawah_has_permission('manage_payments')
           or not public.dawah_receipt_matches_verified_transaction(new.data)
       ) then
        raise exception 'A public receipt must match a completed or reversed finance record';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_dawah_privileged_fields_trigger on public.app_records;
create trigger protect_dawah_privileged_fields_trigger
    before insert or update on public.app_records
    for each row execute function public.protect_dawah_privileged_fields();
