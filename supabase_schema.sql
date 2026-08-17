create extension if not exists pgcrypto;

create table if not exists public.app_stores (
    key text primary key,
    data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.app_records (
    id uuid primary key default gen_random_uuid(),
    collection text not null,
    data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists app_records_collection_idx on public.app_records (collection);
create index if not exists app_records_data_gin_idx on public.app_records using gin (data);

create table if not exists public.admin_roles (
    uid uuid primary key,
    data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.app_stores enable row level security;
alter table public.app_records enable row level security;
alter table public.admin_roles enable row level security;

drop policy if exists "Authenticated users can read app stores" on public.app_stores;
drop policy if exists "Public users can read app stores" on public.app_stores;
drop policy if exists "Authenticated users can write app stores" on public.app_stores;
drop policy if exists "Authenticated users can read app records" on public.app_records;
drop policy if exists "Public users can verify receipts and members" on public.app_records;
drop policy if exists "Authenticated users can write app records" on public.app_records;
drop policy if exists "Users can read their own admin role" on public.admin_roles;
drop policy if exists "First authenticated user can create main admin role" on public.admin_roles;
drop policy if exists "Authenticated admins can manage admin roles" on public.admin_roles;
drop policy if exists "Authenticated users can read admin roles" on public.admin_roles;
drop policy if exists "Authenticated users can write admin roles" on public.admin_roles;
drop policy if exists "Authenticated users can read allowed app stores" on public.app_stores;
drop policy if exists "Admins can write app stores" on public.app_stores;
drop policy if exists "Users read owned records and admins read all" on public.app_records;
drop policy if exists "Users create owned records and admins create all" on public.app_records;
drop policy if exists "Users update owned profiles and admins update all" on public.app_records;
drop policy if exists "Admins delete app records" on public.app_records;
drop policy if exists "Main admin can write admin roles" on public.admin_roles;

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
          and lower(coalesce(data ->> 'isMainAdmin', 'false')) = 'true'
    );
$$;

create or replace function public.dawah_record_is_owned(record_data jsonb)
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
    select auth.uid() is not null and (
        coalesce(record_data ->> 'ownerUid', '') = auth.uid()::text
        or coalesce(record_data ->> 'authUid', '') = auth.uid()::text
        or coalesce(record_data ->> 'uid', '') = auth.uid()::text
        or (
            coalesce(auth.jwt() ->> 'email', '') <> ''
            and (
                lower(coalesce(record_data ->> 'ownerEmail', '')) = lower(auth.jwt() ->> 'email')
                or lower(coalesce(record_data ->> 'authEmail', '')) = lower(auth.jwt() ->> 'email')
                or lower(coalesce(record_data ->> 'email', '')) = lower(auth.jwt() ->> 'email')
                or lower(coalesce(record_data ->> 'studentEmail', '')) = lower(auth.jwt() ->> 'email')
                or lower(coalesce(record_data ->> 'memberEmail', '')) = lower(auth.jwt() ->> 'email')
            )
        )
    );
$$;

revoke all on function public.is_dawah_admin(uuid) from public;
revoke all on function public.is_dawah_main_admin(uuid) from public;
revoke all on function public.dawah_record_is_owned(jsonb) from public;
grant execute on function public.is_dawah_admin(uuid) to authenticated;
grant execute on function public.is_dawah_main_admin(uuid) to authenticated;
grant execute on function public.dawah_record_is_owned(jsonb) to authenticated;

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

create policy "Admins can write app stores"
    on public.app_stores for all
    to authenticated
    using (public.is_dawah_admin())
    with check (public.is_dawah_admin());

create policy "Users read owned records and admins read all"
    on public.app_records for select
    to authenticated
    using (
        public.is_dawah_admin()
        or public.dawah_record_is_owned(data)
        or collection in ('receiptVerifications', 'memberVerifications', 'membershipCards')
    );

create policy "Public users can verify receipts and members"
    on public.app_records for select
    to anon
    using (collection in ('receiptVerifications', 'memberVerifications', 'membershipCards'));

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

create policy "Users update owned profiles and admins update all"
    on public.app_records for update
    to authenticated
    using (
        public.is_dawah_admin()
        or (collection = 'members' and public.dawah_record_is_owned(data))
    )
    with check (
        public.is_dawah_admin()
        or (collection = 'members' and public.dawah_record_is_owned(data))
    );

create policy "Admins delete app records"
    on public.app_records for delete
    to authenticated
    using (public.is_dawah_admin());

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

create or replace function public.protect_dawah_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    if public.is_dawah_admin(auth.uid()) then
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
    ) then
        raise exception 'Officer roles and approval fields can only be changed by an admin';
    end if;

    return new;
end;
$$;

drop trigger if exists protect_dawah_privileged_fields_trigger on public.app_records;
create trigger protect_dawah_privileged_fields_trigger
    before update on public.app_records
    for each row execute function public.protect_dawah_privileged_fields();

update public.app_records
set data = data
    - 'password'
    - 'confirmPassword'
    - 'passwordHash'
    - 'passwordSalt'
    - 'passwordIterations'
    - 'passwordAlgorithm'
where data ?| array[
    'password', 'confirmPassword', 'passwordHash', 'passwordSalt',
    'passwordIterations', 'passwordAlgorithm'
];

update public.app_stores
set data = data
    - 'password'
    - 'confirmPassword'
    - 'passwordHash'
    - 'passwordSalt'
    - 'passwordIterations'
    - 'passwordAlgorithm'
where data ?| array[
    'password', 'confirmPassword', 'passwordHash', 'passwordSalt',
    'passwordIterations', 'passwordAlgorithm'
];

-- Legacy browser-admin accounts contain password-derived fields nested in arrays.
-- Supabase Auth and admin_roles replace this store, so remove any cloud copy.
delete from public.app_stores where key = 'DawaahAdminAccounts';

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_stores'
    ) then
        alter publication supabase_realtime add table public.app_stores;
    end if;
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_records'
    ) then
        alter publication supabase_realtime add table public.app_records;
    end if;
end;
$$;
