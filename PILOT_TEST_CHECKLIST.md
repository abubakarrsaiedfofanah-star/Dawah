# Validation Checklist

Use this before inviting many users.

## Student

- Register/login works.
- Dashboard opens after login.
- Profile information can be viewed/updated.
- Research AI answers inside dashboard.
- Voice question upload/recording shows clear status.
- Research history appears after asking questions.
- Events, announcements, resources, and daily hadith display correctly.
- Welfare request can be submitted.
- Payment/donation proof upload works if enabled.

## Officer

- Officer registration/login works.
- Role workspace opens for the correct role.
- Research AI answers inside officer workspace.
- Hadith Arabic suggestion works through Cloudflare.
- Hadith can be marked Draft, Needs Verification, or Verified.
- Only verified hadiths appear as public daily hadith.
- Officer permissions match the role.

## Admin

- Admin login works.
- Admin dashboard stats load.
- Database record cards open.
- Research usage logs show search/filter/export.
- Admin can approve/verify hadiths.
- Admin can manage announcements, resources, gallery, leadership, and roles.
- Backup button downloads Supabase JSON.
- Disabled legacy AI endpoints do not affect the current chat.

## Security

- Supabase Hosting serves only the static files in `Supabase-public`.
- Supabase rules are deployed before inviting testers.
- `npm.cmd run test:rules` passes before deploying rule changes.
- Live UI smoke passes after deploy:
  - `$env:PLAYWRIGHT_BASE_URL='https://your-supabase-ready-domain.example'; npm.cmd run test:ui`
- Live feature audit passes after deploy:
  - `npm.cmd run test:live`
- Admin login is confirmed manually with the private main admin account.
- Public verification pages open:
  - `verify-member.html`
  - `verify-receipt.html`
- Public verification records do not contain phone, email, address, emergency contact, guardian, or other private fields.
- Temporary validation accounts are removed after test runs when applicable.
- Research AI is not available outside login/dashboard.
- Cloudflare Worker health is online.
- Cloudflare Worker rate limit is enabled.
