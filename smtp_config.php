<?php
// Dawa'ah SMTP settings for password reset codes.
// Prefer setting these as hosting environment variables so real email credentials are not stored in code.

define('SMTP_ENABLED', filter_var(getenv('SMTP_ENABLED') ?: false, FILTER_VALIDATE_BOOLEAN));
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'smtp.example.com');
define('SMTP_PORT', intval(getenv('SMTP_PORT') ?: 587));
define('SMTP_USERNAME', getenv('SMTP_USERNAME') ?: 'no-reply@example.com');
define('SMTP_PASSWORD', getenv('SMTP_PASSWORD') ?: 'your-email-password');
define('SMTP_ENCRYPTION', getenv('SMTP_ENCRYPTION') ?: 'tls'); // tls, ssl, or none
define('SMTP_FROM_EMAIL', getenv('SMTP_FROM_EMAIL') ?: 'no-reply@example.com');
define('SMTP_FROM_NAME', getenv('SMTP_FROM_NAME') ?: "Dawa'ah System");
