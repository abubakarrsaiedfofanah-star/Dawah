# Dawa'ah Production Deployment Checklist

Use this before putting the system in front of real students and officers.

## Can Do Before Credentials

- Upload the project to PHP/MySQL hosting.
- Create the MySQL database and update `DB_HOST`, `DB_USER`, `DB_PASS`, and `DB_NAME` as hosting environment variables.
- Set real admin environment variables:
  - `DAWAAH_ADMIN_USERNAME`
  - `DAWAAH_ADMIN_EMAIL`
  - `DAWAAH_ADMIN_PASSWORD`
- Open `hosting_check.php` on the hosted domain and fix any item marked "Needs attention".
- Create the real main admin, then add the two allowed sub-admins inside the admin panel.
- Test one student registration, one officer promotion, one manual payment, one donation, one receipt, and one admin password reset.
- Remove or ignore sample data before real launch.

## Needs SMTP Credentials

Admin forgot-password needs email delivery. Ask the hosting provider or organization email admin for:

- `SMTP_ENABLED=true`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_ENCRYPTION` (`tls`, `ssl`, or `none`)
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

After setting SMTP, request an admin reset code and confirm it arrives in the registered admin email inbox.

## Needs M-Pesa Daraja Credentials

The organization should own the official M-Pesa/Daraja account. They should give you only:

- `MPESA_ENV`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_BUSINESS_SHORT_CODE`
- `MPESA_PASSKEY`
- `MPESA_TRANSACTION_TYPE`
- `MPESA_CALLBACK_URL`

Do not ask for or store M-Pesa PINs, bank passwords, Safaricom portal passwords, or personal phone access.

## Final Checks

- `hosting_check.php` shows SMTP ready.
- `hosting_check.php` shows M-Pesa STK ready, if Daraja is live.
- Admin login uses a strong password and email reset works.
- Treasurer can approve/reject pending payments and donations.
- Receipts show correct receipt number, status, amount, and approver.
- Officer dashboards show only the correct role responsibilities.
