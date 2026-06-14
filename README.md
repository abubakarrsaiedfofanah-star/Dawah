# UMMA University Dawah Team - Non-Profit Management System

A community-focused management platform for the UMMA University Dawah Team, designed to manage member welfare, charitable donations, volunteer service, and spiritual engagement.

## Project Layout

- `index.html`, `daawah.js`, `daawah.css` - public site and student dashboard.
- `officer.html`, `officer.js` - officer registration and workspace entry.
- `admin.html`, `admin.js` - admin dashboard.
- `Supabase_shared.js` - Supabase Auth, Supabase REST, and Supabase Auth helpers.
- `features/` - generated feature-owned HTML/CSS/JS folders for easier maintenance and fault isolation.
- `Supabase.rules` - production Supabase security rules.
- `cloudflare-worker/` - Groq AI proxy Worker.
- `vercel.json` - Vercel static hosting config. Vercel runs `npm run build` and serves this repo root.

## Setup

Install dependencies:

```powershell
npm.cmd install
```

Run the app locally from the source files:

```powershell
npm.cmd run serve
```

Open `http://127.0.0.1:8000/index.html`.

Regenerate feature modules after changing large page markup:

```powershell
npm.cmd run features:generate
```

Runtime JavaScript and CSS are also split into ordered feature slices under `features/**/runtime/`.
Edit those runtime files for feature fixes, then rebuild the browser bundles:

```powershell
npm.cmd run runtime:assemble
```

Use this only when you intentionally want to re-split the current browser bundles:

```powershell
npm.cmd run runtime:split
```

## Build And Deploy

Prepare the static files:

```powershell
npm.cmd run build
```

For Vercel, keep the Output Directory as `.` because the build updates files in the repo root.

Deploy hosting and rules:

```powershell
Supabase deploy --project umma-university-da-awah-team
```

Deploy only Supabase rules:

```powershell
Supabase deploy --only Supabase:rules --project umma-university-da-awah-team
```

## Tests

Local UI smoke tests:

```powershell
npm.cmd run test:local
```

Supabase rules tests with the emulator:

```powershell
npm.cmd run test:rules
```

If the Supabase emulator is already running on `127.0.0.1:9195`:

```powershell
npm.cmd run test:rules:existing
```


## Security Checklist

- Supabase Supabase Auth client token exchange is implemented in `Supabase_shared.js`.
- Supabase web API key referrer restriction is applied for the official Supabase Hosting domains.
- Google/Supabase owner account has 2-Step Verification enabled.
- Deploy `Supabase.rules` before inviting testers.
- Keep Cloudflare Worker secrets out of the repo. Configure `GROQ_API_KEY` with `wrangler secret put GROQ_API_KEY`.
- Keep at least two working passkeys or recovery methods for the owner account.
- Grant officer/admin authority with Supabase admin roles, not member profile role fields:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\service-account.json"
npm.cmd run claims:set -- --email treasurer@example.com --role treasurer
```

## Admin Hardening Notes

- Dashboard health now checks app files, Supabase data access, Supabase Auth client loading, public verification pages, Research AI, and recent backup status.
- Main admin backup downloads record the last backup time in the browser and include local admin notification history.
- Finance proof uploads are limited to JPG, PNG, WebP, or PDF files up to 3MB.
- Supabase security rules now trust officer/admin role authority from Supabase admin roles or protected admin records, not self-editable member profile roles.

## Non-Profit Features

- **Constituent Care**: Dedicated module for Welfare Requests to support students in need.
- **Fundraising & Dues**: Clear tracking of membership dues versus charitable donations with automated receipt generation.
- **Volunteerism**: Integrated service tracking for event coordination and community outreach.
- **Identity**: Digital membership card system with public QR verification to ensure community trust.
