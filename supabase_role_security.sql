-- Role-scoped Supabase RLS policies for the existing Dawah schema.
-- Run supabase_schema.sql first on a new project, then run this migration.
-- This migration is safe to re-run. It does not delete application data.

alter table public.app_stores enable row level security;
alter table public.app_records enable row level security;
alter table public.admin_roles enable row level security;

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

-- Officers can read only the records covered by their approved role.
drop policy if exists "Authenticated users can read app records" on public.app_records;
drop policy if exists "Authenticated users can write app records" on public.app_records;
drop policy if exists "Public users can verify receipts and members" on public.app_records;
drop policy if exists "Users read owned records and admins read all" on public.app_records;
drop policy if exists "Users create owned records and admins create all" on public.app_records;
drop policy if exists "Admins delete app records" on public.app_records;
create policy "Users and assigned officers read permitted records"
    on public.app_records for select
    to authenticated
    using (
        public.is_dawah_admin()
        or public.dawah_record_is_owned(data)
        or collection in ('receiptVerifications', 'memberVerifications', 'membershipCards')
        or (collection = 'members' and public.dawah_has_permission('manage_members'))
        or (collection in ('payments', 'donations') and public.dawah_has_permission('manage_payments'))
        or (collection = 'welfareRequests' and public.dawah_has_permission('manage_welfare'))
        or (collection in ('eventRegistrations', 'volunteerRegistrations') and public.dawah_has_permission('manage_events'))
    );

create policy "Public users can verify receipts and members"
    on public.app_records for select
    to anon
    using (collection in ('receiptVerifications', 'memberVerifications', 'membershipCards'));

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
                'eventRegistrations', 'volunteerRegistrations', 'auditLogs'
            )
            and public.dawah_record_is_owned(data)
            and lower(coalesce(data ->> 'role', 'student')) not in ('admin', 'main-admin', 'super-admin')
        )
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
        or (collection = 'welfareRequests' and public.dawah_has_permission('manage_welfare'))
        or (collection in ('eventRegistrations', 'volunteerRegistrations') and public.dawah_has_permission('manage_events'))
    )
    with check (
        public.is_dawah_admin()
        or (collection = 'members' and public.dawah_record_is_owned(data))
        or (collection = 'members' and public.dawah_has_permission('manage_members'))
        or (collection in ('payments', 'donations') and public.dawah_has_permission('manage_payments'))
        or (collection = 'welfareRequests' and public.dawah_has_permission('manage_welfare'))
        or (collection in ('eventRegistrations', 'volunteerRegistrations') and public.dawah_has_permission('manage_events'))
    );

-- Store keys remain isolated by role; unrelated settings and permission assignments stay admin-only.
drop policy if exists "Authenticated users can read app stores" on public.app_stores;
drop policy if exists "Public users can read app stores" on public.app_stores;
drop policy if exists "Authenticated users can write app stores" on public.app_stores;
drop policy if exists "Authenticated users can read allowed app stores" on public.app_stores;
drop policy if exists "Admins can write app stores" on public.app_stores;
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
begin
    if public.is_dawah_admin(auth.uid()) then
        return new;
    end if;

    requested_role := lower(replace(replace(trim(coalesce(new.data ->> 'role', 'student')), '-', '_'), ' ', '_'));
    requested_status := lower(trim(coalesce(new.data ->> 'status', '')));

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
    ) then
        raise exception 'Officer roles, approval, and account identity fields can only be changed by an admin';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_dawah_privileged_fields_trigger on public.app_records;
create trigger protect_dawah_privileged_fields_trigger
    before insert or update on public.app_records
    for each row execute function public.protect_dawah_privileged_fields();
