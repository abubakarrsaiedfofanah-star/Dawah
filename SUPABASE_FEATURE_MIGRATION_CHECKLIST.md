# Supabase Feature Migration Checklist

Use this file to track what still needs to move from Firebase/local browser storage to Supabase.

## Status Key

- `[ ]` Not migrated yet
- `[~]` Started / partial
- `[x]` Done

## Core Setup

- `[~]` Supabase starter files added:
  - `Dawa'ah/supabase/schema.sql`
  - `Dawa'ah/supabase_config.template.js`
  - `Dawa'ah/supabase_client.js`
- `[x]` Add Supabase JS CDN script to `index.html`, `admin.html`, `officer.html`, `verify-member.html`, and `verify-receipt.html`.
- `[x]` Add `supabase_config.js` and `supabase_client.js` script tags to those same pages.
- `[x]` Update Content Security Policy `connect-src` to allow Supabase project URLs.
- `[ ]` Create Supabase Storage buckets for uploaded media/photos/voice files if needed.
- `[ ]` Decide whether hosting stays Firebase Hosting, moves to Supabase, or moves to another static host.

## Authentication And Sessions

- `[ ]` Student registration: replace Firebase Auth signup with `supabase.auth.signUp`.
- `[ ]` Student login: replace Firebase Auth login with `supabase.auth.signInWithPassword`.
- `[ ]` Student logout/session checks: replace `window.DawaahCloud.hasAuthSession/currentUid/currentEmail/logout`.
- `[ ]` Password reset: replace Firebase reset email/local reset flow with Supabase reset flow.
- `[ ]` Admin login/register: replace Firebase admin auth and local admin fallback.
- `[ ]` Officer login/register: replace local/Firebase officer account flow.
- `[ ]` Role checks: replace Firebase custom claims/admin role docs with Supabase `profiles.role` plus RLS.
- `[ ]` Realtime auth: replace Firebase realtime auth helper with Supabase session handling.

## Member And Profile Data

- `[ ]` Members collection -> `profiles` table.
- `[ ]` Student profile save/load.
- `[ ]` Member database list/search.
- `[ ]` Member status changes: pending/active/rejected.
- `[ ]` Officer/student role request approval.
- `[ ]` Admin/officer member edits.
- `[ ]` Digital membership card records.
- `[ ]` Public member verification page: `verify-member.html`.

## Public Website Content

- `[ ]` Site settings/contact/social links.
- `[ ]` Public landing page content.
- `[ ]` Public activities preview.
- `[ ]` Leadership list.
- `[ ]` Gallery/media list.
- `[ ]` Public hadith/daily hadith content.
- `[ ]` Public contact voice messages.

## Student Workspace

- `[ ]` Dashboard stats/cards.
- `[ ]` Activities save/load.
- `[ ]` Events save/load.
- `[ ]` Event registrations.
- `[ ]` Announcements.
- `[ ]` Resources.
- `[ ]` Research history.
- `[ ]` Welfare requests.
- `[ ]` Prayer times.
- `[ ]` Religious activities.
- `[ ]` Dues/payments.
- `[ ]` Donations.
- `[ ]` Reports.
- `[ ]` Volunteer opportunities and volunteer registrations.
- `[ ]` Student notifications.
- `[ ]` Workspace settings.

## Officer Workspace

- `[ ]` Officer auth/session.
- `[ ]` Officer shared member list.
- `[ ]` Officer student registration records.
- `[ ]` Officer notes/plans/content workflows.
- `[ ]` Officer hadith management.
- `[ ]` Officer gallery/media workflows.
- `[ ]` Officer prayer times and religious activity updates.

## Admin Workspace

- `[ ]` Admin roles and permissions.
- `[ ]` Admin account management.
- `[ ]` Admin activity/audit logs.
- `[ ]` System health checks.
- `[ ]` Dashboard statistics and detail views.
- `[ ]` Site settings.
- `[ ]` Announcements CRUD.
- `[ ]` Events CRUD and event registration review.
- `[ ]` Leadership CRUD.
- `[ ]` Gallery CRUD and media storage.
- `[ ]` Hadith CRUD and Arabic suggestion review flow.
- `[ ]` Welfare request review.
- `[ ]` Prayer times and religious activities.
- `[ ]` Resources CRUD.
- `[ ]` Finance/payment/donation approval.
- `[ ]` Receipt generation and verification records.
- `[ ]` Database backup/export flow.

## Finance And Verification

- `[ ]` Payments table and approval workflow.
- `[ ]` Donations table and approval workflow.
- `[ ]` Receipt uniqueness checks.
- `[ ]` Receipt verification page: `verify-receipt.html`.
- `[ ]` Finance signature/settings.

## AI Research

- `[~]` Chat auth/session detection can now see Supabase sessions, but Firebase detection is still present during migration.
- `[ ]` Research history should save to `ai_research_logs`.
- `[ ]` Admin research usage dashboard should read from `ai_research_logs`.
- `[ ]` Cloudflare Worker can stay as-is unless you want it to write logs directly to Supabase.

## Files Still Firebase-Specific

- `[ ]` `Dawa'ah/firebase_shared.js`
- `[ ]` `Dawa'ah/firestore.rules`
- `[ ]` `Dawa'ah/storage.rules`
- `[ ]` `Dawa'ah/firebase.json`
- `[ ]` `Dawa'ah/.firebaserc`
- `[ ]` `Dawa'ah/firebase-public/`
- `[ ]` `Dawa'ah/functions/`
- `[ ]` Firebase admin/test scripts inside `Dawa'ah/scripts/`
- `[ ]` Firebase docs:
  - `Dawa'ah/FIREBASE_PRODUCTION_SECURITY_AND_BACKUP.md`
  - Firebase sections in `Dawa'ah/README.md`

## Main Code Areas To Convert

- `[ ]` `Dawa'ah/daawah.js`
  - student auth
  - student dashboard
  - public content
  - welfare/events/resources/payments/donations
  - member database
  - verification data writes
- `[ ]` `Dawa'ah/admin.js`
  - admin auth
  - admin roles
  - all admin CRUD
  - dashboard stats
  - audit/backup/health checks
- `[ ]` `Dawa'ah/officer.js`
  - officer auth
  - officer member/content workflows
- `[ ]` `Dawa'ah/ai_assistant_widget.js`
  - session detection
  - research history logging
- `[ ]` `Dawa'ah/verify-member.html`
  - public member/card lookup
- `[ ]` `Dawa'ah/verify-receipt.html`
  - public receipt lookup

## Suggested Migration Order

1. Supabase setup, config, CSP, and script tags.
2. Student auth and `profiles`.
3. Admin/officer roles and RLS.
4. Members/profile/member database.
5. Public content: settings, leadership, gallery, activities, resources.
6. Welfare/events/announcements.
7. Payments/donations/receipts.
8. Verification pages.
9. Research logs and admin dashboards.
10. Remove Firebase-only files from this Supabase copy after all features work.
