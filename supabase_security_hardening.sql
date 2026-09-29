-- Security hardening for projects that already ran the Dawah schema and role migrations.
-- Safe to re-run. Run after supabase_role_security.sql and supabase_public_donations.sql.

-- Set an empty search_path on privileged functions. All application objects called by
-- these functions are schema-qualified in the function definitions.
alter function public.is_dawah_admin(uuid) set search_path = '';
alter function public.is_dawah_main_admin(uuid) set search_path = '';
alter function public.dawah_get_public_membership_card(text) set search_path = '';
alter function public.dawah_get_public_member_verification(text) set search_path = '';
alter function public.dawah_get_public_receipt(text) set search_path = '';
alter function public.protect_dawah_finance_signature() set search_path = '';
alter function public.dawah_has_permission(text) set search_path = '';
alter function public.dawah_receipt_matches_verified_transaction(jsonb) set search_path = '';
alter function public.protect_dawah_privileged_fields() set search_path = '';
alter function public.dawah_submit_public_donation(jsonb) set search_path = '';

-- Public verification goes through narrowly scoped RPCs; never expose the underlying
-- member, card, or receipt rows through a permissive table policy.
drop policy if exists "Public users can verify receipts and members" on public.app_records;

-- Minimize the data returned by public student lookups and reject implausibly short
-- lookup strings, which reduces accidental disclosure and trivial enumeration.
create or replace function public.dawah_get_public_member_verification(lookup_identifier text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select jsonb_build_object(
        'fullName', coalesce(verification.data ->> 'fullName', verification.data ->> 'name', verification.data ->> 'username'),
        'studentId', coalesce(verification.data ->> 'studentId', verification.data ->> 'student_id', verification.data ->> 'username')
    )
    from public.app_records verification
    where verification.collection = 'memberVerifications'
      and lower(coalesce(verification.data ->> 'status', 'active')) in ('active', 'approved')
      and length(trim(coalesce(lookup_identifier, ''))) between 5 and 120
      and (
          lower(coalesce(verification.data ->> 'studentId', verification.data ->> 'student_id', '')) = lower(trim(lookup_identifier))
          or lower(coalesce(verification.data ->> 'username', '')) = lower(trim(lookup_identifier))
          or lower(coalesce(verification.data ->> 'registrationNumber', '')) = lower(trim(lookup_identifier))
      )
    order by verification.updated_at desc, verification.created_at desc
    limit 1;
$$;

-- Remove default PUBLIC execution grants from privileged helpers and grant only the
-- authenticated app role where policies need to call them.
revoke all on function public.is_dawah_admin(uuid) from public, anon;
revoke all on function public.is_dawah_main_admin(uuid) from public, anon;
revoke all on function public.dawah_record_is_owned(jsonb) from public, anon;
revoke all on function public.dawah_has_permission(text) from public, anon;
revoke all on function public.dawah_receipt_matches_verified_transaction(jsonb) from public, anon, authenticated;
revoke all on function public.protect_dawah_finance_signature() from public, anon, authenticated;
revoke all on function public.protect_dawah_privileged_fields() from public, anon, authenticated;

grant execute on function public.is_dawah_admin(uuid) to authenticated;
grant execute on function public.is_dawah_main_admin(uuid) to authenticated;
grant execute on function public.dawah_record_is_owned(jsonb) to authenticated;
grant execute on function public.dawah_has_permission(text) to authenticated;

-- These public RPCs return only verification fields and are the sole anon access path.
revoke all on function public.dawah_get_public_membership_card(text) from public;
revoke all on function public.dawah_get_public_member_verification(text) from public;
revoke all on function public.dawah_get_public_receipt(text) from public;
grant execute on function public.dawah_get_public_membership_card(text) to anon, authenticated;
grant execute on function public.dawah_get_public_member_verification(text) to anon, authenticated;
grant execute on function public.dawah_get_public_receipt(text) to anon, authenticated;

revoke all on function public.dawah_submit_public_donation(jsonb) from public;
revoke all on function public.dawah_submit_public_donation(jsonb) from anon, authenticated;
grant execute on function public.dawah_submit_public_donation(jsonb) to anon, authenticated;
