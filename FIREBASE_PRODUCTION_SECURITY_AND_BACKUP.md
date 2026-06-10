# Firebase Production Security And Backup

This project now works with Firebase Hosting and Firestore. Before handing it to a large group, use this checklist.

## Current Security Status

- Firebase App Check client exchange is working on the live app.
- Firebase web API key is restricted by HTTP referrer to the official web domains.
- Google/Firebase owner account has 2-Step Verification enabled.
- Firestore rules are deployed and should be tested with `npm.cmd run test:rules` before future rule changes.
- The Firebase web API key is present in frontend code by design. It is not a secret; keep referrer restrictions and App Check enabled.
- Cloudflare/Groq secrets must stay only in Cloudflare Worker secrets.

## 1. Rotate Shared Hosting Passwords

Change any hosting password that was shared during setup. Use a unique password and keep it outside the codebase.

## 2. Custom Claims For Roles

Firestore rules already check member documents and future custom claims. For stronger production security, set claims from a trusted admin environment only.

Example Admin SDK script:

```js
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const uid = "USER_FIREBASE_UID";

await admin.auth().setCustomUserClaims(uid, {
  admin: true,
  role: "treasurer"
});

console.log("Claims updated");
```

Recommended claims:

- Main admin: `{ superAdmin: true, admin: true, role: "admin" }`
- Admin: `{ admin: true, role: "admin" }`
- Treasurer: `{ role: "treasurer" }`
- Secretary: `{ role: "secretary" }`
- Student: no admin claim needed

After claims are set, the user should log out and log in again so the token refreshes.

## 3. Backups

Current quick backup:

- Login as main admin.
- Open Admin Panel.
- Click `Download Database Backup`.
- Store the JSON file privately.

Recommended routine:

- Download a backup before every major change.
- Download a weekly backup while the system is active.
- Keep at least three recent backup copies.

Production automatic backup option:

- Upgrade Firebase/Google Cloud if needed.
- Use scheduled Cloud Functions or Cloud Scheduler.
- Export Firestore to a private Cloud Storage bucket.

## 4. Push Notifications

The app now supports browser permission and local browser alerts for important status changes. True push notifications need Firebase Cloud Messaging plus a server or Cloud Function to send messages.

Recommended future flow:

- Save each user device token in Firestore.
- Send notification when:
  - a receipt is approved or rejected;
  - a new officer registers;
  - an officer task changes;
  - a welfare request status changes.

## 5. Verification Records

Receipt verification and member verification are public read-only checks. Admin/finance/member managers control writes through Firestore rules.

Current safeguards:

- Anonymous visitors can open one verification record by exact ID.
- Anonymous visitors cannot list verification collections.
- Firestore rules reject private fields in public verification documents.
- Newly issued public membership card records do not write owner email, phone, address, emergency contact, or guardian details.

Do not add these fields to public verification collections:

- `email`
- `phone`
- `homeAddress`
- `emergencyContact`
- `localGuardian`
- `ownerEmail`

## 6. Account Recovery

The owner account currently has passkeys, Google prompt, and phone recovery. Keep at least two working passkeys on trusted devices. If a phone becomes available later, add an authenticator app as another backup second step.

## 7. Live Audit Cleanup

Live audits create temporary users named like:

- `pilot.student.TIMESTAMP@example.com`
- `pilot.officer.TIMESTAMP@example.com`

Clean them after testing:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_JSON = '<service-account-json>'
npm.cmd run cleanup:live-audit
```

Without Admin SDK credentials, delete those pilot users manually from Firebase Authentication and remove matching Firestore `members`, `memberVerifications`, and `membershipCards` records.
