# Supabase Migration Guide

This folder is a separate copy of the Firebase project. Keep the original folder as the working Firebase version:

`C:\Users\gues\Desktop\love`

Use this copy for Supabase conversion:

`C:\Users\gues\Desktop\love-supabase-ready`

## Recommended Step-By-Step Order

1. Create a Supabase project.
2. Run `Dawa'ah/supabase/schema.sql` in the Supabase SQL Editor.
3. Copy `Dawa'ah/supabase_config.template.js` to `Dawa'ah/supabase_config.js`.
4. Put your Supabase project URL and anon public key in `supabase_config.js`.
5. Add the Supabase browser script and `supabase_config.js` / `supabase_client.js` to the HTML pages.
6. Replace Firebase auth first:
   - student register/login
   - officer login
   - admin login
   - logout/session checks
7. Replace member/profile data next.
8. Replace content tables one by one:
   - activities
   - welfare requests
   - resources
   - gallery
   - payments/donations
   - announcements
   - hadiths
9. After each feature works, remove only that feature's Firebase calls.
10. When all features are migrated, remove Firebase scripts, Firebase config, Firestore rules, and Firebase hosting files from this copy only.

## Main Firebase Files To Replace Slowly

- `Dawa'ah/firebase_shared.js`
- Firebase script references in:
  - `Dawa'ah/index.html`
  - `Dawa'ah/admin.html`
  - `Dawa'ah/officer.html`
- Firebase helper calls through `window.DawaahCloud`
- Firestore rules/storage rules when no longer needed

## Important

Do not delete Firebase from the original project while migrating. This copy is for testing Supabase safely.

