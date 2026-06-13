# Supabase Ready Transfer

This folder is a copy of the existing Dawah app with the source features preserved and the browser data layer switched to `supabase_shared.js`.

## Setup

1. Create a Supabase project.
2. Run `supabase_schema.sql` in the Supabase SQL editor.
3. Put your Supabase project URL and anon key in `supabase_config.js`.
4. Add your live domain to `enabledHosts`.
5. Open `index.html`, `officer.html`, or `admin.html`.

## Vercel Deployment (Supabase)

1. Connect your GitHub repository to Vercel.
2. Set the **Build Command** to `npm run build`.
3. Set the **Root Directory** to this `supabase-ready` folder.
4. Leave the **Output Directory** as `.` or let `vercel.json` provide it.
5. Add your `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables so the build can generate `supabase_config.js`.

The app still uses the old `window.SupabaseBackend` API name so the existing feature code can run without a full rewrite. Internally, that API now talks to Supabase Auth, Postgres tables, and Realtime.

## Data Tables

- `app_stores`: key/value JSON stores used by dashboard settings and legacy store-style features.
- `app_records`: generic records grouped by `collection`, matching the current Supabase collection-style calls.
- `admin_roles`: admin authority by Supabase Auth user id.

## Important Next Step

The included RLS policies are permissive enough for migration testing. Before production, tighten them per feature role: students, officers, treasurer, secretary, chairperson, and main admin.

After creating your first admin user in Supabase Auth, bootstrap that account in the SQL editor:

```sql
insert into public.admin_roles (uid, data)
values ('AUTH_USER_UUID_HERE', '{"role":"main-admin","status":"Active"}'::jsonb)
on conflict (uid) do update set data = excluded.data;
```
