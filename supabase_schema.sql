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

create policy "Authenticated users can read app stores"
    on public.app_stores for select
    to authenticated
    using (true);

create policy "Public users can read app stores"
    on public.app_stores for select
    to anon
    using (true);

create policy "Authenticated users can write app stores"
    on public.app_stores for all
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated users can read app records"
    on public.app_records for select
    to authenticated
    using (true);

create policy "Public users can verify receipts and members"
    on public.app_records for select
    to anon
    using (collection in ('receiptVerifications', 'memberVerifications', 'membershipCards'));

create policy "Authenticated users can write app records"
    on public.app_records for all
    to authenticated
    using (true)
    with check (true);

create policy "Users can read their own admin role"
    on public.admin_roles for select
    to authenticated
    using (uid = auth.uid());

create policy "Authenticated users can read admin roles"
    on public.admin_roles for select
    to authenticated
    using (true);

create policy "Authenticated users can write admin roles"
    on public.admin_roles for all
    to authenticated
    using (true)
    with check (true);

alter publication supabase_realtime add table public.app_stores;
alter publication supabase_realtime add table public.app_records;
