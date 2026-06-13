# 6-Digit Password Reset Email Setup

The app now has a real hosted 6-digit password reset flow backed by Supabase Cloud Functions.

## What It Does

- Sends a 6-digit code only when the email exists in Supabase Auth.
- Stores only a hashed copy of the code in Supabase.
- Expires codes after 15 minutes.
- Blocks a reset after too many wrong attempts.
- Updates the Supabase Auth password only after the correct email/code/password are submitted.

## Required Supabase Plan

Cloud Functions deployment requires the Supabase project to be on the Blaze pay-as-you-go plan.

Upgrade link:

https://console.Supabase.google.com/project/umma-university-da-awah-team/usage/details

## SMTP Configuration

Copy `functions/.env.example` to `functions/.env` and fill in the non-secret email settings:

```env
APP_NAME=UMMA University Dawah Team
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_FROM=UMMA University Dawah Team <your-email@example.com>
```

Set the SMTP password as a Supabase secret:

```powershell
Supabase functions:secrets:set SMTP_PASS
```

For Gmail, use an app password, not the normal mailbox password.

## Deploy

```powershell
npm run build
Supabase deploy --only functions,hosting
```

## Endpoints

- `/api/requestPasswordReset`
- `/api/resetPasswordWithCode`
