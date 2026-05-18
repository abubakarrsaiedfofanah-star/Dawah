<?php
// Dawa'ah M-Pesa Daraja configuration.
// Prefer setting these as hosting environment variables so real credentials are not stored in code.
// Callback URL must be publicly reachable; localhost cannot receive Safaricom callbacks.
define('MPESA_ENV', getenv('MPESA_ENV') ?: 'sandbox'); // sandbox or production
define('MPESA_CONSUMER_KEY', getenv('MPESA_CONSUMER_KEY') ?: 'YOUR_DARAJA_CONSUMER_KEY');
define('MPESA_CONSUMER_SECRET', getenv('MPESA_CONSUMER_SECRET') ?: 'YOUR_DARAJA_CONSUMER_SECRET');
define('MPESA_BUSINESS_SHORT_CODE', getenv('MPESA_BUSINESS_SHORT_CODE') ?: '174379');
define('MPESA_PASSKEY', getenv('MPESA_PASSKEY') ?: 'YOUR_DARAJA_PASSKEY');
define('MPESA_TRANSACTION_TYPE', getenv('MPESA_TRANSACTION_TYPE') ?: 'CustomerPayBillOnline');
define('MPESA_CALLBACK_URL', getenv('MPESA_CALLBACK_URL') ?: 'https://your-domain.com/dawaah/mpesa_api.php?action=callback');
?>
