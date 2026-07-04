drop policy if exists "Users can read their own admin role" on public.admin_roles;
drop policy if exists "First authenticated user can create main admin role" on public.admin_roles;
drop policy if exists "Authenticated admins can manage admin roles" on public.admin_roles;
drop policy if exists "Authenticated users can read admin roles" on public.admin_roles;
drop policy if exists "Authenticated users can write admin roles" on public.admin_roles;

create policy "Authenticated users can read admin roles"
    on public.admin_roles for select
    to authenticated
    using (true);

create policy "Authenticated users can write admin roles"
    on public.admin_roles for all
    to authenticated
    using (true)
    with check (true);
