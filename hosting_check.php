<?php
require_once 'database.php';
require_once 'db_operations.php';

function dawaah_size_bytes($value) {
    $value = trim((string)$value);
    if ($value === '') return 0;
    $unit = strtolower(substr($value, -1));
    $number = floatval($value);
    if ($unit === 'g') return (int)($number * 1024 * 1024 * 1024);
    if ($unit === 'm') return (int)($number * 1024 * 1024);
    if ($unit === 'k') return (int)($number * 1024);
    return (int)$number;
}

function dawaah_yes_no($value) {
    return $value ? 'Ready' : 'Needs attention';
}

$upload_dirs = [
    'uploads' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads',
    'profile_photos' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'profile_photos',
    'gallery' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'gallery',
    'voice_messages' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'voice_messages'
];

$dir_status = [];
foreach ($upload_dirs as $name => $path) {
    if (!is_dir($path)) {
        @mkdir($path, 0755, true);
    }
    $dir_status[$name] = is_dir($path) && is_writable($path);
}

$mpesa_configured = false;
if (file_exists(__DIR__ . DIRECTORY_SEPARATOR . 'mpesa_config.php')) {
    require_once 'mpesa_config.php';
    $mpesa_configured = defined('MPESA_CONSUMER_KEY')
        && defined('MPESA_CONSUMER_SECRET')
        && defined('MPESA_PASSKEY')
        && MPESA_CONSUMER_KEY !== 'YOUR_DARAJA_CONSUMER_KEY'
        && MPESA_CONSUMER_SECRET !== 'YOUR_DARAJA_CONSUMER_SECRET'
        && MPESA_PASSKEY !== 'YOUR_DARAJA_PASSKEY';
}

$checks = [
    'PHP version' => PHP_VERSION,
    'MySQLi extension' => dawaah_yes_no(extension_loaded('mysqli')),
    'PDO MySQL extension' => dawaah_yes_no(extension_loaded('pdo_mysql')),
    'Database connection' => dawaah_yes_no(getDBConnection() instanceof mysqli),
    'File uploads' => dawaah_yes_no(filter_var(ini_get('file_uploads'), FILTER_VALIDATE_BOOLEAN)),
    'Upload max filesize' => ini_get('upload_max_filesize') . ' (' . number_format(dawaah_size_bytes(ini_get('upload_max_filesize'))) . ' bytes)',
    'Post max size' => ini_get('post_max_size') . ' (' . number_format(dawaah_size_bytes(ini_get('post_max_size'))) . ' bytes)',
    'Mail function' => dawaah_yes_no(function_exists('mail')),
    'SMTP configured' => dawaah_yes_no(function_exists('isSmtpConfigured') && isSmtpConfigured()),
    'Email delivery' => dawaah_yes_no((function_exists('isSmtpConfigured') && isSmtpConfigured()) || function_exists('mail')),
    'cURL extension' => dawaah_yes_no(extension_loaded('curl')),
    'M-Pesa STK' => dawaah_yes_no(extension_loaded('curl') && $mpesa_configured)
];

$production_warnings = [];
if (DAWAAH_ADMIN_USERNAME === 'admin' || DAWAAH_ADMIN_EMAIL === 'dawaah.admin@dawaah.local') {
    $production_warnings[] = 'Set DAWAAH_ADMIN_USERNAME, DAWAAH_ADMIN_EMAIL, and DAWAAH_ADMIN_PASSWORD to real production values before launch.';
}
if (!(function_exists('isSmtpConfigured') && isSmtpConfigured())) {
    $production_warnings[] = 'SMTP is not configured yet, so admin password reset emails may not reach inboxes.';
}
if (!$mpesa_configured) {
    $production_warnings[] = 'M-Pesa Daraja credentials are not configured yet. STK Push will remain in manual mode.';
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dawa'ah Hosting Check</title>
    <style>
        body { margin: 0; font-family: Arial, sans-serif; background: #0b0f14; color: #f7f0d2; }
        main { max-width: 900px; margin: 0 auto; padding: 32px 18px; }
        h1 { color: #d8ad46; margin-bottom: 8px; }
        p { color: #d9d2bd; }
        table { width: 100%; border-collapse: collapse; background: #151a22; border: 1px solid rgba(216,173,70,.35); }
        th, td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,.08); text-align: left; }
        th { color: #d8ad46; }
        .ok { color: #6ee7a8; font-weight: 700; }
        .bad { color: #ff8a8a; font-weight: 700; }
        .note { margin-top: 18px; padding: 14px; background: rgba(216,173,70,.12); border-left: 4px solid #d8ad46; }
    </style>
</head>
<body>
<main>
    <h1>Dawa'ah Hosting Check</h1>
    <p>Open this page after upload to confirm the server supports the main system features.</p>
    <table>
        <thead><tr><th>Check</th><th>Status</th></tr></thead>
        <tbody>
        <?php foreach ($checks as $label => $status): ?>
            <?php $is_attention = $status === 'Needs attention'; ?>
            <tr>
                <td><?php echo htmlspecialchars($label); ?></td>
                <td class="<?php echo $is_attention ? 'bad' : 'ok'; ?>"><?php echo htmlspecialchars($status); ?></td>
            </tr>
        <?php endforeach; ?>
        <?php foreach ($dir_status as $label => $status): ?>
            <tr>
                <td>Writable folder: <?php echo htmlspecialchars($label); ?></td>
                <td class="<?php echo $status ? 'ok' : 'bad'; ?>"><?php echo htmlspecialchars(dawaah_yes_no($status)); ?></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
    <div class="note">
        Password reset emails use <strong>smtp_config.php</strong> when SMTP is configured, otherwise PHP mail() is used. M-Pesa STK requires cURL plus real Daraja credentials in <strong>mpesa_config.php</strong>.
    </div>
    <?php if (!empty($production_warnings)): ?>
        <div class="note">
            <strong>Before launch:</strong>
            <ul>
                <?php foreach ($production_warnings as $warning): ?>
                    <li><?php echo htmlspecialchars($warning); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>
</main>
</body>
</html>
