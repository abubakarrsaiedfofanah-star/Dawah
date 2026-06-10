# 6-Digit Password Reset Email Setup

The app now has a real hosted 6-digit password reset flow backed by Firebase Cloud Functions.

## What It Does

- Sends a 6-digit code only when the email exists in Firebase Auth.
- Stores only a hashed copy of the code in Firestore.
- Expires codes after 15 minutes.
- Blocks a reset after too many wrong attempts.
- Updates the Firebase Auth password only after the correct email/code/password are submitted.

## Required Firebase Plan

Cloud Functions deployment requires the Firebase project to be on the Blaze pay-as-you-go plan.

Upgrade link:

https://console.firebase.google.com/project/umma-university-da-awah-team/usage/details

## SMTP Configuration

Copy `functions/.env.example` to `functions/.env` and fill in the non-secret email settings:

```env
APP_NAME=UMMA University Da'awah Team
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_FROM=UMMA University Da'awah Team <your-email@example.com>
```

Set the SMTP password as a Firebase secret:

```powershell
firebase functions:secrets:set SMTP_PASS
```

For Gmail, use an app password, not the normal mailbox password.

## Deploy

```powershell
npm run build
firebase deploy --only functions,hosting
```

## Endpoints

- `/api/requestPasswordReset`
- `/api/resetPasswordWithCode`
