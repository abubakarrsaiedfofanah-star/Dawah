# UMMA University Da'awah Team App

Static Firebase Hosting app for the UMMA University Da'awah Team public site, student dashboard, officer workspace, admin panel, Firestore data, and Cloudflare-backed research AI.

## Project Layout

- `index.html`, `daawah.js`, `daawah.css` - public site and student dashboard.
- `officer.html`, `officer.js` - officer registration and workspace entry.
- `admin.html`, `admin.js` - admin dashboard.
- `firebase_shared.js` - Firebase Auth, Firestore REST, and App Check helpers.
- `features/` - generated feature-owned HTML/CSS/JS folders for easier maintenance and fault isolation.
- `firestore.rules` - production Firestore security rules.
- `cloudflare-worker/` - Groq AI proxy Worker.
- `scripts/build-firebase-public.ps1` - prepares the Firebase Hosting output folder.
- `firebase-public/` - generated hosting output. Build it locally before deploy; do not edit it by hand.

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

Prepare the Firebase Hosting folder:

```powershell
npm.cmd run build
```

Deploy hosting and rules:

```powershell
firebase deploy --project umma-university-da-awah-team
```

Deploy only Firestore rules:

```powershell
firebase deploy --only firestore:rules --project umma-university-da-awah-team
```

## Tests

Local UI smoke tests:

```powershell
npm.cmd run test:local
```

Firestore rules tests with the emulator:

```powershell
npm.cmd run test:rules
```

If the Firestore emulator is already running on `127.0.0.1:9195`:

```powershell
npm.cmd run test:rules:existing
```

Live Firebase feature audit:

```powershell
npm.cmd run test:live
```

The live audit creates timestamped test accounts in the production Firebase project. Use it intentionally, not as the default quick test.
After each live audit, check `test-results/live-created-users.json` for the exact pilot accounts to delete from Firebase Authentication and matching Firestore member or role request records.

To clean up the live audit accounts with Firebase Admin credentials:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\service-account.json"
npm.cmd run cleanup:live-audit
```

Admin live audit requires:

```powershell
$env:DAWAAH_ADMIN_EMAIL="admin@example.com"
$env:DAWAAH_ADMIN_PASSWORD="..."
npm.cmd run test:live
```

## Security Checklist

- Firebase App Check client token exchange is implemented in `firebase_shared.js`.
- Firebase web API key referrer restriction is applied for the official Firebase Hosting domains.
- Google/Firebase owner account has 2-Step Verification enabled.
- Deploy `firestore.rules` before inviting testers.
- Keep Cloudflare Worker secrets out of the repo. Configure `GROQ_API_KEY` with `wrangler secret put GROQ_API_KEY`.
- Keep at least two working passkeys or recovery methods for the owner account.
- Grant officer/admin authority with Firebase custom claims, not member profile role fields:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\service-account.json"
npm.cmd run claims:set -- --email treasurer@example.com --role treasurer
```

## Pilot Flow

Use `PILOT_TEST_CHECKLIST.md` before inviting many users. Recommended order:

1. Run `npm.cmd run test:local`.
2. Run `npm.cmd run test:rules`.
3. Build and deploy.
4. Run `npm.cmd run test:live`.
5. Download an admin backup before larger pilot changes.

## Admin Hardening Notes

- Dashboard health now checks app files, Firebase data access, App Check client loading, public verification pages, Research AI, and recent backup status.
- Main admin backup downloads record the last backup time in the browser and include local admin notification history.
- Finance proof uploads are limited to JPG, PNG, WebP, or PDF files up to 3MB.
- Firestore security rules now trust officer/admin role authority from Firebase custom claims or protected admin records, not self-editable member profile roles.
