<?php
// Dawa'ah Database Operations Helper

require_once 'database.php';

// ============================================
// SITE SETTINGS
// ============================================

function ensureSiteSettingsTable() {
    $conn = getDBConnection();
    $conn->query("CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        updated_by INT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )");
}

function defaultSiteSettings() {
    return array(
        'contact_location' => 'UMMA University, Main Campus',
        'contact_phone' => '+23231422167',
        'contact_email' => 'info@dawaah.org',
        'contact_hours' => 'Monday - Friday: 10 AM - 6 PM',
        'social_whatsapp' => 'https://api.whatsapp.com/send?phone=23231422167&text=Assalamu%20alaikum%2C%20I%20would%20like%20to%20contact%20Dawa%27ah.',
        'social_facebook' => '',
        'social_x' => '',
        'social_instagram' => '',
        'social_youtube' => '',
        'social_tiktok' => '',
        'social_linkedin' => ''
    );
}

function getSiteSettings() {
    ensureSiteSettingsTable();
    $settings = defaultSiteSettings();
    $conn = getDBConnection();
    $result = $conn->query("SELECT setting_key, setting_value FROM site_settings");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            if (array_key_exists($row['setting_key'], $settings)) {
                $settings[$row['setting_key']] = $row['setting_value'] ?? '';
            }
        }
    }
    return $settings;
}

function normalizeSiteSettingValue($key, $value) {
    $value = trim((string)$value);
    if ($value === '') {
        return '';
    }
    if ($key === 'contact_email') {
        return filter_var($value, FILTER_VALIDATE_EMAIL) ? $value : '';
    }
    if (strpos($key, 'social_') === 0) {
        if ($key === 'social_whatsapp' && preg_match('/^\+?[0-9\s-]{7,20}$/', $value)) {
            $phone = preg_replace('/\D+/', '', $value);
            return 'https://api.whatsapp.com/send?phone=' . $phone . '&text=Assalamu%20alaikum%2C%20I%20would%20like%20to%20contact%20Dawa%27ah.';
        }
        return filter_var($value, FILTER_VALIDATE_URL) ? $value : '';
    }
    return $value;
}

function saveSiteSettings($settings_data, $updated_by = null) {
    ensureSiteSettingsTable();
    $allowed = defaultSiteSettings();
    $conn = getDBConnection();
    $updated_by = $updated_by ? intval($updated_by) : null;
    $saved = getSiteSettings();

    $stmt = $conn->prepare("INSERT INTO site_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)");
    if (!$stmt) {
        return array('success' => false, 'error' => 'Could not prepare settings update');
    }

    foreach ($allowed as $key => $default_value) {
        if (!array_key_exists($key, $settings_data)) {
            continue;
        }
        $value = normalizeSiteSettingValue($key, $settings_data[$key]);
        $stmt->bind_param("ssi", $key, $value, $updated_by);
        if (!$stmt->execute()) {
            return array('success' => false, 'error' => 'Could not save ' . $key);
        }
        $saved[$key] = $value;
    }

    return array('success' => true, 'settings' => $saved);
}

// ============================================
// USER OPERATIONS
// ============================================

function registerUser($username, $email, $password, $role = 'student') {
    $conn = getDBConnection();
    ensureUserRoleColumn();
    $username = trim($username);
    $email = trim($email);
    $role = trim($role) !== '' ? trim($role) : 'student';

    if ($username === '' || $email === '' || $password === '') {
        return array('success' => false, 'error' => 'Student ID, email, and password are required.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return array('success' => false, 'error' => 'Please enter a valid email address.');
    }
    if (strlen($password) < 6) {
        return array('success' => false, 'error' => 'Password must be at least 6 characters.');
    }

    $stmt_existing_account = $conn->prepare("SELECT username, email FROM users WHERE username = ? OR email = ? LIMIT 1");
    $stmt_existing_account->bind_param("ss", $username, $email);
    $stmt_existing_account->execute();
    $existing_account = $stmt_existing_account->get_result()->fetch_assoc();
    if ($existing_account) {
        if (strcasecmp($existing_account['email'], $email) === 0) {
            return array('success' => false, 'error' => 'This email is already registered. Please login or use a different email.');
        }
        return array('success' => false, 'error' => 'This Student ID is already registered. Please login or contact admin.');
    }

    if (isPasswordAlreadyUsed($password)) {
        return array('success' => false, 'error' => 'Please choose a different password. Each student must use a unique password.');
    }

    if ($role === 'admin') {
        $admin_count = $conn->query("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'");
        $total_admins = $admin_count ? intval($admin_count->fetch_assoc()['total']) : 0;
        if ($total_admins > 0) {
            return array('success' => false, 'error' => 'Only the first main admin can register. Other admins must be added inside the admin panel.');
        }
    }
    if (!in_array($role, array('student', 'admin'), true)) {
        $stmt_existing_role = $conn->prepare("SELECT id FROM users WHERE role = ? LIMIT 1");
        $stmt_existing_role->bind_param("s", $role);
        $stmt_existing_role->execute();
        if ($stmt_existing_role->get_result()->num_rows > 0) {
            return array('success' => false, 'error' => ucfirst($role) . ' role is already requested or assigned. Main admin must approve/reject or remove the existing holder first.');
        }
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $status = $role === 'student' || $role === 'admin' ? 'active' : 'inactive';
    
    $sql = "INSERT INTO users (username, email, password, role, status) 
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $username, $email, $hashed_password, $role, $status);
    
    if ($stmt->execute()) {
        return array('success' => true, 'user_id' => $conn->insert_id);
    } else {
        if ($conn->errno === 1062 || stripos($stmt->error, 'Duplicate') !== false) {
            return array('success' => false, 'error' => 'This account is already registered. Please login or use a different Student ID/email.');
        }
        return array('success' => false, 'error' => $stmt->error);
    }
}

function isPasswordAlreadyUsed($password) {
    $conn = getDBConnection();
    $result = $conn->query("SELECT password FROM users");
    if (!$result) {
        return false;
    }
    while ($row = $result->fetch_assoc()) {
        if (!empty($row['password']) && password_verify($password, $row['password'])) {
            return true;
        }
    }
    return false;
}

function loginUser($username, $password) {
    $conn = getDBConnection();
    ensureUserRoleColumn();
    $sql = "SELECT id, username, email, role, status FROM users WHERE username = ? OR email = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return array('success' => false, 'error' => 'No registered account found with that Student ID or email. Please register first.');
    }

    $user = $result->fetch_assoc();
    $sql_pass = "SELECT password FROM users WHERE id = ?";
    $stmt_pass = $conn->prepare($sql_pass);
    $stmt_pass->bind_param("i", $user['id']);
    $stmt_pass->execute();
    $pass_result = $stmt_pass->get_result()->fetch_assoc();

    if (password_verify($password, $pass_result['password'])) {
        if ($user['status'] !== 'active') {
            return array('success' => false, 'error' => 'Your account is pending approval or inactive. Please contact the admin.');
        }

        // Update last login
        $update_login = "UPDATE users SET last_login = NOW() WHERE id = ?";
        $stmt_login = $conn->prepare($update_login);
        $stmt_login->bind_param("i", $user['id']);
        $stmt_login->execute();

        return array('success' => true, 'user' => $user);
    }
    
    return array('success' => false, 'error' => 'Incorrect password. Please try again or use Forgot Password.');
}

function ensurePasswordResetRequestsTable() {
    $conn = getDBConnection();
    $conn->query("CREATE TABLE IF NOT EXISTS password_reset_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NULL,
        email VARCHAR(150) NOT NULL,
        token_hash VARCHAR(255) NULL,
        attempts INT DEFAULT 0,
        last_attempt_at TIMESTAMP NULL,
        status ENUM('pending', 'used', 'expired') DEFAULT 'pending',
        requested_ip VARCHAR(45),
        user_agent VARCHAR(500),
        expires_at TIMESTAMP NULL,
        processed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )");
    ensureColumn('password_reset_requests', 'attempts', "ALTER TABLE password_reset_requests ADD COLUMN attempts INT DEFAULT 0 AFTER token_hash");
    ensureColumn('password_reset_requests', 'last_attempt_at', "ALTER TABLE password_reset_requests ADD COLUMN last_attempt_at TIMESTAMP NULL AFTER attempts");
}

function requestPasswordReset($email, $ip_address = '', $user_agent = '') {
    $conn = getDBConnection();
    ensurePasswordResetRequestsTable();

    $email = trim($email);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return array('success' => false, 'error' => 'Please enter a valid email address.');
    }

    $stmt_user = $conn->prepare("SELECT id, email FROM users WHERE email = ? LIMIT 1");
    $stmt_user->bind_param("s", $email);
    $stmt_user->execute();
    $user = $stmt_user->get_result()->fetch_assoc();

    if (!$user) {
        return array('success' => false, 'error' => 'This email is not registered. Please use the email you registered with.');
    }

    $user_id = intval($user['id']);
    $user_agent = substr($user_agent, 0, 500);
    $stmt_recent = $conn->prepare("SELECT created_at FROM password_reset_requests WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND) ORDER BY created_at DESC LIMIT 1");
    $stmt_recent->bind_param("i", $user_id);
    $stmt_recent->execute();
    if ($stmt_recent->get_result()->num_rows > 0) {
        return array('success' => false, 'error' => 'Please wait one minute before requesting another reset code.');
    }

    $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $code_hash = password_hash($code, PASSWORD_BCRYPT);

    $stmt_expire = $conn->prepare("UPDATE password_reset_requests SET status = 'expired', processed_at = NOW() WHERE user_id = ? AND status = 'pending'");
    $stmt_expire->bind_param("i", $user_id);
    $stmt_expire->execute();

    $stmt = $conn->prepare("INSERT INTO password_reset_requests (user_id, email, token_hash, requested_ip, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))");
    $stmt->bind_param("issss", $user_id, $email, $code_hash, $ip_address, $user_agent);
    if (!$stmt->execute()) {
        return array('success' => false, 'error' => $stmt->error);
    }

    $mail_sent = sendPasswordResetCode($email, $code);

    $result = array(
        'success' => true,
        'recorded' => true,
        'reset_request_id' => $conn->insert_id,
        'mail_sent' => $mail_sent,
        'expires_in_minutes' => 15
    );

    if (isLocalRequest()) {
        $result['dev_code'] = $code;
    }

    return $result;
}

function sendPasswordResetCode($email, $code) {
    $subject = "Dawa'ah password reset code";
    $message = "Your Dawa'ah password reset code is: $code\n\nThis code expires in 15 minutes. If you did not request this, ignore this email.";
    if (isSmtpConfigured()) {
        return sendMailWithSmtp($email, $subject, $message);
    }

    if (!function_exists('mail')) {
        return false;
    }

    $headers = "From: no-reply@dawaah.local\r\n";
    return @mail($email, $subject, $message, $headers);
}

function isStrongAdminPassword($password) {
    return strlen($password) >= 12
        && preg_match('/[A-Z]/', $password)
        && preg_match('/[a-z]/', $password)
        && preg_match('/[0-9]/', $password)
        && preg_match('/[^A-Za-z0-9]/', $password);
}

function requestAdminPasswordReset($email, $ip_address = '', $user_agent = '') {
    $conn = getDBConnection();
    ensurePasswordResetRequestsTable();

    $email = trim($email);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return array('success' => false, 'error' => 'Please enter a valid email address.');
    }

    $stmt_user = $conn->prepare("SELECT id, email FROM users WHERE email = ? AND role = 'admin' AND status = 'active' LIMIT 1");
    $stmt_user->bind_param("s", $email);
    $stmt_user->execute();
    $user = $stmt_user->get_result()->fetch_assoc();

    if (!$user) {
        return array('success' => true, 'recorded' => false, 'mail_sent' => false, 'expires_in_minutes' => 15);
    }

    $user_id = intval($user['id']);
    $user_agent = substr($user_agent, 0, 500);
    $stmt_recent = $conn->prepare("SELECT created_at FROM password_reset_requests WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 2 MINUTE) ORDER BY created_at DESC LIMIT 1");
    $stmt_recent->bind_param("i", $user_id);
    $stmt_recent->execute();
    if ($stmt_recent->get_result()->num_rows > 0) {
        return array('success' => false, 'error' => 'Please wait two minutes before requesting another admin reset code.');
    }

    $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $code_hash = password_hash($code, PASSWORD_BCRYPT);

    $stmt_expire = $conn->prepare("UPDATE password_reset_requests SET status = 'expired', processed_at = NOW() WHERE user_id = ? AND status = 'pending'");
    $stmt_expire->bind_param("i", $user_id);
    $stmt_expire->execute();

    $stmt = $conn->prepare("INSERT INTO password_reset_requests (user_id, email, token_hash, requested_ip, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))");
    $stmt->bind_param("issss", $user_id, $email, $code_hash, $ip_address, $user_agent);
    if (!$stmt->execute()) {
        return array('success' => false, 'error' => $stmt->error);
    }

    $subject = "Dawa'ah admin password reset code";
    $message = "Your Dawa'ah admin password reset code is: $code\n\nThis code expires in 10 minutes. If you did not request this, contact the main admin immediately.";
    $mail_sent = isSmtpConfigured()
        ? sendMailWithSmtp($email, $subject, $message)
        : (function_exists('mail') ? @mail($email, $subject, $message, "From: no-reply@dawaah.local\r\n") : false);

    return array(
        'success' => true,
        'recorded' => true,
        'reset_request_id' => $conn->insert_id,
        'mail_sent' => $mail_sent,
        'expires_in_minutes' => 10
    );
}

function resetAdminPasswordWithCode($email, $code, $new_password) {
    $conn = getDBConnection();
    ensurePasswordResetRequestsTable();

    $email = trim($email);
    $code = trim($code);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return array('success' => false, 'error' => 'Please enter a valid email address.');
    }
    if (!preg_match('/^\d{6}$/', $code)) {
        return array('success' => false, 'error' => 'Enter the 6-digit code sent to your admin email.');
    }
    if (!isStrongAdminPassword($new_password)) {
        return array('success' => false, 'error' => 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.');
    }
    if (isPasswordAlreadyUsed($new_password)) {
        return array('success' => false, 'error' => 'Please choose a different password. This password is already used.');
    }

    $stmt_user = $conn->prepare("SELECT id FROM users WHERE email = ? AND role = 'admin' AND status = 'active' LIMIT 1");
    $stmt_user->bind_param("s", $email);
    $stmt_user->execute();
    $user = $stmt_user->get_result()->fetch_assoc();
    if (!$user) {
        return array('success' => false, 'error' => 'Invalid or expired reset code.');
    }

    $user_id = intval($user['id']);
    $stmt = $conn->prepare("SELECT id, token_hash, attempts FROM password_reset_requests WHERE user_id = ? AND email = ? AND status = 'pending' AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("is", $user_id, $email);
    $stmt->execute();
    $request = $stmt->get_result()->fetch_assoc();
    if (!$request) {
        return array('success' => false, 'error' => 'Invalid or expired reset code.');
    }

    $request_id = intval($request['id']);
    if (intval($request['attempts']) >= 3) {
        $stmt_expire = $conn->prepare("UPDATE password_reset_requests SET status = 'expired', processed_at = NOW() WHERE id = ?");
        $stmt_expire->bind_param("i", $request_id);
        $stmt_expire->execute();
        return array('success' => false, 'error' => 'Too many wrong attempts. Request a new reset code.');
    }
    if (!password_verify($code, $request['token_hash'])) {
        $stmt_attempt = $conn->prepare("UPDATE password_reset_requests SET attempts = attempts + 1, last_attempt_at = NOW() WHERE id = ?");
        $stmt_attempt->bind_param("i", $request_id);
        $stmt_attempt->execute();
        return array('success' => false, 'error' => 'Invalid reset code.');
    }

    $password_hash = password_hash($new_password, PASSWORD_BCRYPT);
    $stmt_update = $conn->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
    $stmt_update->bind_param("si", $password_hash, $user_id);
    if (!$stmt_update->execute()) {
        return array('success' => false, 'error' => $stmt_update->error);
    }

    $stmt_used = $conn->prepare("UPDATE password_reset_requests SET status = 'used', processed_at = NOW() WHERE id = ?");
    $stmt_used->bind_param("i", $request_id);
    $stmt_used->execute();

    return array('success' => true, 'user_id' => $user_id);
}

function isSmtpConfigured() {
    $config = __DIR__ . DIRECTORY_SEPARATOR . 'smtp_config.php';
    if (!file_exists($config)) {
        return false;
    }
    require_once $config;
    return defined('SMTP_ENABLED')
        && SMTP_ENABLED
        && defined('SMTP_HOST')
        && defined('SMTP_USERNAME')
        && defined('SMTP_PASSWORD')
        && SMTP_HOST !== ''
        && SMTP_USERNAME !== ''
        && SMTP_PASSWORD !== ''
        && SMTP_HOST !== 'smtp.example.com';
}

function sendMailWithSmtp($to, $subject, $body) {
    require_once __DIR__ . DIRECTORY_SEPARATOR . 'smtp_config.php';

    $host = SMTP_HOST;
    $port = defined('SMTP_PORT') ? intval(SMTP_PORT) : 587;
    $encryption = defined('SMTP_ENCRYPTION') ? strtolower(SMTP_ENCRYPTION) : 'tls';
    $from_email = defined('SMTP_FROM_EMAIL') && SMTP_FROM_EMAIL !== '' ? SMTP_FROM_EMAIL : SMTP_USERNAME;
    $from_name = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : "Dawa'ah System";
    $transport_host = $encryption === 'ssl' ? 'ssl://' . $host : $host;

    $socket = @fsockopen($transport_host, $port, $errno, $errstr, 20);
    if (!$socket) {
        return false;
    }
    stream_set_timeout($socket, 20);

    $reader = function() use ($socket) {
        $response = '';
        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $response;
    };

    $command = function($line, $expected) use ($socket, $reader) {
        fwrite($socket, $line . "\r\n");
        $response = $reader();
        return substr($response, 0, strlen($expected)) === $expected;
    };

    $initial = $reader();
    if (substr($initial, 0, 3) !== '220') {
        fclose($socket);
        return false;
    }

    if (!$command('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), '250')) {
        fclose($socket);
        return false;
    }

    if ($encryption === 'tls') {
        if (!$command('STARTTLS', '220')) {
            fclose($socket);
            return false;
        }
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            return false;
        }
        if (!$command('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), '250')) {
            fclose($socket);
            return false;
        }
    }

    if (!$command('AUTH LOGIN', '334')
        || !$command(base64_encode(SMTP_USERNAME), '334')
        || !$command(base64_encode(SMTP_PASSWORD), '235')) {
        fclose($socket);
        return false;
    }

    $encoded_subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $headers = array(
        'From: ' . smtpHeaderAddress($from_email, $from_name),
        'To: <' . $to . '>',
        'Subject: ' . $encoded_subject,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit'
    );
    $message = implode("\r\n", $headers) . "\r\n\r\n" . str_replace("\n", "\r\n", $body) . "\r\n";

    $sent = $command('MAIL FROM:<' . $from_email . '>', '250')
        && $command('RCPT TO:<' . $to . '>', '250')
        && $command('DATA', '354');

    if ($sent) {
        fwrite($socket, smtpDotStuff($message) . "\r\n.\r\n");
        $sent = substr($reader(), 0, 3) === '250';
    }

    $command('QUIT', '221');
    fclose($socket);
    return $sent;
}

function smtpHeaderAddress($email, $name) {
    $safe_name = str_replace(array("\r", "\n", '"'), '', $name);
    return '"' . $safe_name . '" <' . $email . '>';
}

function smtpDotStuff($message) {
    return preg_replace('/^\./m', '..', $message);
}

function isLocalRequest() {
    $remote = $_SERVER['REMOTE_ADDR'] ?? '';
    return in_array($remote, array('127.0.0.1', '::1'), true);
}

function resetPasswordWithCode($email, $code, $new_password) {
    $conn = getDBConnection();
    ensurePasswordResetRequestsTable();

    $email = trim($email);
    $code = trim($code);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return array('success' => false, 'error' => 'Please enter a valid email address.');
    }
    if (!preg_match('/^\d{6}$/', $code)) {
        return array('success' => false, 'error' => 'Enter the 6-digit code sent to your email.');
    }
    if (strlen($new_password) < 6) {
        return array('success' => false, 'error' => 'Password must be at least 6 characters.');
    }
    if (isPasswordAlreadyUsed($new_password)) {
        return array('success' => false, 'error' => 'Please choose a different password. This password is already used.');
    }

    $stmt_user = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt_user->bind_param("s", $email);
    $stmt_user->execute();
    $user = $stmt_user->get_result()->fetch_assoc();
    if (!$user) {
        return array('success' => false, 'error' => 'This email is not registered. Please use the email you registered with.');
    }

    $user_id = intval($user['id']);
    $stmt = $conn->prepare("SELECT id, token_hash, attempts FROM password_reset_requests WHERE user_id = ? AND email = ? AND status = 'pending' AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("is", $user_id, $email);
    $stmt->execute();
    $request = $stmt->get_result()->fetch_assoc();
    if (!$request) {
        return array('success' => false, 'error' => 'Invalid or expired reset code.');
    }
    $request_id = intval($request['id']);
    if (intval($request['attempts']) >= 5) {
        $stmt_expire = $conn->prepare("UPDATE password_reset_requests SET status = 'expired', processed_at = NOW() WHERE id = ?");
        $stmt_expire->bind_param("i", $request_id);
        $stmt_expire->execute();
        return array('success' => false, 'error' => 'Too many wrong attempts. Request a new reset code.');
    }
    if (!password_verify($code, $request['token_hash'])) {
        $stmt_attempt = $conn->prepare("UPDATE password_reset_requests SET attempts = attempts + 1, last_attempt_at = NOW() WHERE id = ?");
        $stmt_attempt->bind_param("i", $request_id);
        $stmt_attempt->execute();
        $remaining = max(0, 4 - intval($request['attempts']));
        return array('success' => false, 'error' => 'Invalid reset code. Attempts remaining: ' . $remaining . '.');
    }

    $password_hash = password_hash($new_password, PASSWORD_BCRYPT);
    $stmt_update = $conn->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
    $stmt_update->bind_param("si", $password_hash, $user_id);
    if (!$stmt_update->execute()) {
        return array('success' => false, 'error' => $stmt_update->error);
    }

    $stmt_used = $conn->prepare("UPDATE password_reset_requests SET status = 'used', processed_at = NOW() WHERE id = ?");
    $stmt_used->bind_param("i", $request_id);
    $stmt_used->execute();

    return array('success' => true);
}

function getUserById($user_id) {
    $conn = getDBConnection();
    ensureUserRoleColumn();
    $sql = "SELECT * FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getPendingRoleRequests() {
    $conn = getDBConnection();
    ensureUserRoleColumn();
    ensureStudentColumns();
    $sql = "SELECT u.id, u.username, u.email, u.role, u.status, u.created_at,
                   s.first_name, s.last_name, s.student_id, s.phone, s.course, s.year_of_study
            FROM users u
            LEFT JOIN students s ON s.user_id = u.id
            WHERE u.role NOT IN ('student', 'admin') AND u.status <> 'active'
            ORDER BY u.created_at ASC";
    return fetchAll($sql);
}

function getRoleAssignableMembers() {
    $conn = getDBConnection();
    ensureUserRoleColumn();
    ensureStudentColumns();
    $sql = "SELECT u.id, u.username, u.email, u.role, u.status, u.created_at,
                   s.first_name, s.last_name, s.student_id, s.phone, s.course, s.year_of_study
            FROM users u
            LEFT JOIN students s ON s.user_id = u.id
            WHERE u.role <> 'admin' AND u.username <> 'system_admin'
            ORDER BY COALESCE(NULLIF(CONCAT(s.first_name, ' ', s.last_name), ' '), u.username) ASC";
    return fetchAll($sql);
}

function assignMemberRole($user_id, $role, $status = 'active') {
    $conn = getDBConnection();
    ensureUserRoleColumn();
    ensureStudentColumns();
    $user_id = intval($user_id);
    $role = strtolower(trim($role));
    $status = strtolower(trim($status)) === 'inactive' ? 'inactive' : 'active';
    $allowed_roles = array('student', 'chairman', 'chairlady', 'secretary', 'treasurer', 'media', 'organizer', 'imam');

    if ($user_id <= 0) {
        return array('success' => false, 'error' => 'Member is required');
    }
    if (!in_array($role, $allowed_roles, true)) {
        return array('success' => false, 'error' => 'Please select a valid role');
    }

    $stmt_user = $conn->prepare("SELECT id, role FROM users WHERE id = ? AND role <> 'admin' LIMIT 1");
    $stmt_user->bind_param("i", $user_id);
    $stmt_user->execute();
    $user = $stmt_user->get_result()->fetch_assoc();
    if (!$user) {
        return array('success' => false, 'error' => 'Member not found');
    }

    if ($role !== 'student' && $status === 'active') {
        $stmt_existing = $conn->prepare("SELECT id FROM users WHERE role = ? AND status = 'active' AND id <> ? LIMIT 1");
        $stmt_existing->bind_param("si", $role, $user_id);
        $stmt_existing->execute();
        if ($stmt_existing->get_result()->num_rows > 0) {
            return array('success' => false, 'error' => ucfirst($role) . ' role is already active. Remove or deactivate the existing holder first.');
        }
    }

    $stmt_update = $conn->prepare("UPDATE users SET role = ?, status = ? WHERE id = ?");
    $stmt_update->bind_param("ssi", $role, $status, $user_id);
    if (!$stmt_update->execute()) {
        return array('success' => false, 'error' => $stmt_update->error);
    }

    $membership_status = $status === 'active' ? 'active' : 'pending';
    $stmt_student = $conn->prepare("UPDATE students SET membership_status = ? WHERE user_id = ?");
    $stmt_student->bind_param("si", $membership_status, $user_id);
    $stmt_student->execute();

    return array('success' => true, 'user_id' => $user_id, 'role' => $role, 'status' => $status);
}

function resetMemberPassword($user_id, $new_password) {
    $conn = getDBConnection();
    ensureUserRoleColumn();
    $user_id = intval($user_id);
    $new_password = trim($new_password);

    if ($user_id <= 0) {
        return array('success' => false, 'error' => 'Member is required');
    }
    if (strlen($new_password) < 6) {
        return array('success' => false, 'error' => 'Temporary password must be at least 6 characters');
    }
    if (isPasswordAlreadyUsed($new_password)) {
        return array('success' => false, 'error' => 'Please choose a different temporary password. Passwords must be unique.');
    }

    $stmt_user = $conn->prepare("SELECT id FROM users WHERE id = ? AND role <> 'admin' LIMIT 1");
    $stmt_user->bind_param("i", $user_id);
    $stmt_user->execute();
    if ($stmt_user->get_result()->num_rows < 1) {
        return array('success' => false, 'error' => 'Member account not found');
    }

    $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
    $stmt_update = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt_update->bind_param("si", $hashed_password, $user_id);
    if (!$stmt_update->execute()) {
        return array('success' => false, 'error' => $stmt_update->error);
    }

    return array('success' => true, 'user_id' => $user_id);
}

function approveRoleRequest($user_id) {
    $conn = getDBConnection();
    ensureUserRoleColumn();
    ensureStudentColumns();
    $user_id = intval($user_id);
    if ($user_id <= 0) {
        return array('success' => false, 'error' => 'User ID required');
    }

    $stmt = $conn->prepare("SELECT id, role, status FROM users WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    if (!$user) {
        return array('success' => false, 'error' => 'Role request not found');
    }
    if (in_array($user['role'], array('student', 'admin'), true)) {
        return array('success' => false, 'error' => 'This role does not require special approval');
    }

    $stmt_existing = $conn->prepare("SELECT id FROM users WHERE role = ? AND status = 'active' AND id <> ? LIMIT 1");
    $stmt_existing->bind_param("si", $user['role'], $user_id);
    $stmt_existing->execute();
    if ($stmt_existing->get_result()->num_rows > 0) {
        return array('success' => false, 'error' => ucfirst($user['role']) . ' role is already active. Remove or deactivate the existing holder first.');
    }

    $stmt_update = $conn->prepare("UPDATE users SET status = 'active' WHERE id = ?");
    $stmt_update->bind_param("i", $user_id);
    if (!$stmt_update->execute()) {
        return array('success' => false, 'error' => $stmt_update->error);
    }

    $stmt_student = $conn->prepare("UPDATE students SET membership_status = 'active' WHERE user_id = ?");
    $stmt_student->bind_param("i", $user_id);
    $stmt_student->execute();

    return array('success' => true, 'user_id' => $user_id, 'role' => $user['role']);
}

function rejectRoleRequest($user_id) {
    $conn = getDBConnection();
    ensureUserRoleColumn();
    ensureStudentColumns();
    $user_id = intval($user_id);
    if ($user_id <= 0) {
        return array('success' => false, 'error' => 'User ID required');
    }

    $stmt = $conn->prepare("SELECT id, role FROM users WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    if (!$user) {
        return array('success' => false, 'error' => 'Role request not found');
    }
    if (in_array($user['role'], array('student', 'admin'), true)) {
        return array('success' => false, 'error' => 'This role request cannot be rejected here');
    }

    $stmt_update = $conn->prepare("UPDATE users SET role = 'student', status = 'suspended' WHERE id = ?");
    $stmt_update->bind_param("i", $user_id);
    if (!$stmt_update->execute()) {
        return array('success' => false, 'error' => $stmt_update->error);
    }

    $stmt_student = $conn->prepare("UPDATE students SET membership_status = 'inactive' WHERE user_id = ?");
    $stmt_student->bind_param("i", $user_id);
    $stmt_student->execute();

    return array('success' => true, 'user_id' => $user_id, 'rejected_role' => $user['role']);
}

function ensureUserRoleColumn() {
    $conn = getDBConnection();
    if (!tableExists('users')) {
        return;
    }
    $conn->query("ALTER TABLE users MODIFY role ENUM('student', 'executive', 'chairman', 'chairlady', 'secretary', 'treasurer', 'media', 'organizer', 'imam', 'admin') DEFAULT 'student'");
}

// ============================================
// CONTACT VOICE MESSAGE OPERATIONS
// ============================================

function ensureContactVoiceMessagesTable() {
    $conn = getDBConnection();
    $conn->query("CREATE TABLE IF NOT EXISTS contact_voice_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT,
        audio_path VARCHAR(255) NOT NULL,
        audio_mime VARCHAR(100) NOT NULL,
        audio_size INT DEFAULT 0,
        status ENUM('new', 'read') DEFAULT 'new',
        listened_by INT NULL,
        listened_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listened_by) REFERENCES users(id) ON DELETE SET NULL
    )");
}

function saveContactVoiceMessage($data) {
    ensureContactVoiceMessagesTable();
    $conn = getDBConnection();
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $subject = trim($data['subject'] ?? '');
    $message = trim($data['message'] ?? '');
    $audio_path = trim($data['audio_path'] ?? '');
    $audio_mime = trim($data['audio_mime'] ?? '');
    $audio_size = intval($data['audio_size'] ?? 0);

    if ($name === '' || $email === '' || $subject === '' || $audio_path === '') {
        return array('success' => false, 'error' => 'Name, email, subject, and voice message are required');
    }

    $stmt = $conn->prepare("INSERT INTO contact_voice_messages (name, email, subject, message, audio_path, audio_mime, audio_size) VALUES (?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        return array('success' => false, 'error' => $conn->error);
    }
    $stmt->bind_param("ssssssi", $name, $email, $subject, $message, $audio_path, $audio_mime, $audio_size);

    if ($stmt->execute()) {
        return array('success' => true, 'message_id' => $conn->insert_id);
    }
    return array('success' => false, 'error' => $stmt->error);
}

function getContactVoiceMessages($limit = 100) {
    ensureContactVoiceMessagesTable();
    $conn = getDBConnection();
    $limit = max(1, min(200, intval($limit)));
    $stmt = $conn->prepare("SELECT cvm.*, u.username AS listened_by_name
                            FROM contact_voice_messages cvm
                            LEFT JOIN users u ON cvm.listened_by = u.id
                            ORDER BY cvm.created_at DESC
                            LIMIT ?");
    $stmt->bind_param("i", $limit);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function markContactVoiceMessageRead($message_id, $listener_id = 0) {
    ensureContactVoiceMessagesTable();
    $conn = getDBConnection();
    $message_id = intval($message_id);
    $listener_id = intval($listener_id);
    if ($message_id <= 0) {
        return array('success' => false, 'error' => 'Message ID required');
    }

    if ($listener_id > 0) {
        $stmt = $conn->prepare("UPDATE contact_voice_messages SET status = 'read', listened_by = ?, listened_at = NOW() WHERE id = ?");
        $stmt->bind_param("ii", $listener_id, $message_id);
    } else {
        $stmt = $conn->prepare("UPDATE contact_voice_messages SET status = 'read', listened_at = NOW() WHERE id = ?");
        $stmt->bind_param("i", $message_id);
    }

    if ($stmt->execute()) {
        return array('success' => true);
    }
    return array('success' => false, 'error' => $stmt->error);
}

// ============================================
// STUDENT OPERATIONS
// ============================================

function getAcademicCatalog() {
    return array(
        'School of Business & Technology' => array(
            'Bachelor of Business Management (BBM)',
            'Bachelor of Commerce (BCom)',
            'Bachelor of Business Information Technology',
            'Bachelor of Science in Computer Science',
            'Bachelor of Science in Information Technology',
            'Master of Business Administration (MBA)',
            'Diploma in ICT',
            'Diploma in Business Management',
            'Diploma in Business IT & Business Management',
            'Diploma in Human Resource Management',
            'Diploma in Supply Chain Management',
            'Diploma in Islamic Banking and Finance',
            'Certificate in ICT',
            'Certificate in Business Management',
            'Certificate in Human Resource Management',
            'Certificate in Supply Chain Management',
            'Certificate in Business Information Technology',
            'Electrical Engineering',
            'ICT',
            'CISCO Networking',
            'ICDL Courses'
        ),
        'School of Sharia & Islamic Studies' => array(
            'Bachelor of Arts in Islamic Studies',
            'Bachelor of Arts in Sharia',
            'Master of Arts in Islamic Studies',
            'Diploma in Arabic Language and Islamic Studies',
            'Diploma in Islamic Banking and Finance',
            'Certificate in Arabic Language and Islamic Studies'
        ),
        'School of Law and Shari’a' => array(
            'Bachelor of Laws (LL.B) with Sharia & Law',
            'Diploma in Islamic Law and Legal Studies'
        ),
        'School of Education & Social Sciences' => array(
            'Bachelor of Education (B.Ed.)',
            'Bachelor of Education (Arts)',
            'Diploma in Early Childhood Education',
            'Clothing & Textile',
            'Business & Liberal Studies'
        ),
        'School of Nursing & Midwifery' => array(
            'Bachelor of Science in Nursing'
        )
    );
}

function validateAcademicSelection($school, $course, $year_of_study = '', $semester = '') {
    $catalog = getAcademicCatalog();
    if ($school === '' || !isset($catalog[$school])) {
        return array('success' => false, 'error' => 'Please select a valid school');
    }
    if ($course === '' || !in_array($course, $catalog[$school], true)) {
        return array('success' => false, 'error' => 'Please select a valid course for the selected school');
    }
    if ($year_of_study !== '' && !in_array((string)$year_of_study, array('1', '2', '3', '4', '5', '6'), true)) {
        return array('success' => false, 'error' => 'Please select a valid year of study');
    }
    if ($semester !== '' && !in_array((string)$semester, array('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'), true)) {
        return array('success' => false, 'error' => 'Please select a valid semester');
    }
    return array('success' => true);
}

function registerStudent($user_id, $data) {
    $conn = getDBConnection();
    ensureStudentColumns();
    $today = date('Y-m-d');
    $student_id = trim($data['student_id'] ?? '');
    $email = trim($data['email'] ?? '');
    $school = $data['school'] ?? '';
    $semester = $data['semester'] ?? '';
    $degree_type = $data['degree_type'] ?? $data['degreeType'] ?? 'degree';
    $passport_photo = $data['passport_photo'] ?? $data['passportPhoto'] ?? '';
    if (!in_array($degree_type, array('diploma', 'degree'), true)) {
        $degree_type = 'degree';
    }
    $academic_validation = validateAcademicSelection($school, $data['course'] ?? '', $data['year_of_study'] ?? '', $semester);
    if (!$academic_validation['success']) {
        return $academic_validation;
    }

    if ($student_id === '' || $email === '') {
        return array('success' => false, 'error' => 'Student ID and email are required.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return array('success' => false, 'error' => 'Please enter a valid email address.');
    }
    $stmt_existing_student = $conn->prepare("SELECT student_id, email FROM students WHERE (student_id = ? OR email = ?) AND user_id <> ? LIMIT 1");
    $stmt_existing_student->bind_param("ssi", $student_id, $email, $user_id);
    $stmt_existing_student->execute();
    $existing_student = $stmt_existing_student->get_result()->fetch_assoc();
    if ($existing_student) {
        if (strcasecmp($existing_student['email'], $email) === 0) {
            return array('success' => false, 'error' => 'This email already belongs to a registered student.');
        }
        return array('success' => false, 'error' => 'This Student ID already belongs to a registered student.');
    }
    
    $user = getUserById($user_id);
    $membership_status = !empty($user) && $user['status'] === 'active' && $user['role'] === 'student' ? 'active' : 'pending';

    $sql = "INSERT INTO students 
            (user_id, first_name, last_name, student_id, email, phone, gender, 
             nationality, school, course, year_of_study, semester, degree_type, home_address, 
             emergency_contact, emergency_contact_phone, local_guardian, local_guardian_phone, passport_photo, joined_date, membership_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "issssssssssssssssssss",
        $user_id,
        $data['first_name'],
        $data['last_name'],
        $student_id,
        $email,
        $data['phone'],
        $data['gender'],
        $data['nationality'],
        $school,
        $data['course'],
        $data['year_of_study'],
        $semester,
        $degree_type,
        $data['home_address'],
        $data['emergency_contact'],
        $data['emergency_contact_phone'],
        $data['local_guardian'],
        $data['local_guardian_phone'],
        $passport_photo,
        $today,
        $membership_status
    );
    
    if ($stmt->execute()) {
        return array('success' => true, 'student_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getStudentByUserId($user_id) {
    $conn = getDBConnection();
    ensureStudentColumns();
    $sql = "SELECT * FROM students WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getStudentByIdentifier($identifier) {
    $conn = getDBConnection();
    ensureStudentColumns();
    $sql = "SELECT s.*, u.id AS user_id, u.username, u.role
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.student_id = ? OR s.email = ? OR u.username = ? OR u.email = ?
            LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $identifier, $identifier, $identifier, $identifier);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function ensureStudentRecord($data) {
    $conn = getDBConnection();
    $identifier = isset($data['student_id']) && $data['student_id'] !== '' ? $data['student_id'] : ($data['username'] ?? '');
    $email = isset($data['email']) && $data['email'] !== '' ? $data['email'] : ($identifier . '@dawaah.local');
    $existing = getStudentByIdentifier($identifier);
    if (!$existing) {
        $existing = getStudentByIdentifier($email);
    }
    if ($existing && isset($existing['id'])) {
        return array('success' => true, 'student_id' => intval($existing['id']), 'user_id' => intval($existing['user_id']));
    }

    $username = $identifier ?: ('member' . time());
    $role = isset($data['role']) && $data['role'] !== '' ? $data['role'] : 'student';
    $password = password_hash(isset($data['password']) && $data['password'] !== '' ? $data['password'] : 'Dawaah123', PASSWORD_BCRYPT);

    $user_id = 0;
    $stmt_user = $conn->prepare("INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, 'active')");
    $stmt_user->bind_param("ssss", $username, $email, $password, $role);
    if ($stmt_user->execute()) {
        $user_id = $conn->insert_id;
    } else {
        $stmt_find = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1");
        $stmt_find->bind_param("ss", $username, $email);
        $stmt_find->execute();
        $found = $stmt_find->get_result()->fetch_assoc();
        if ($found) {
            $user_id = intval($found['id']);
        }
    }

    if ($user_id <= 0) {
        return array('success' => false, 'error' => 'Could not create or find user record');
    }

    $full_name = trim($data['full_name'] ?? $data['fullName'] ?? $data['name'] ?? $username);
    $parts = preg_split('/\s+/', $full_name);
    $first_name = $data['first_name'] ?? ($parts[0] ?? $username);
    $last_name = $data['last_name'] ?? (count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '-');

    $gender = $data['gender'] ?? 'male';
    $degree_type = $data['degree_type'] ?? $data['degreeType'] ?? 'degree';

    $student = array(
        'first_name' => $first_name,
        'last_name' => $last_name,
        'student_id' => $identifier ?: $username,
        'email' => $email,
        'phone' => $data['phone'] ?? '',
        'gender' => in_array($gender, array('male', 'female', 'other'), true) ? $gender : 'male',
        'nationality' => $data['nationality'] ?? '',
        'school' => $data['school'] ?? '',
        'course' => $data['course'] ?? '',
        'year_of_study' => $data['year_of_study'] ?? $data['yearOfStudy'] ?? '',
        'semester' => $data['semester'] ?? '',
        'degree_type' => in_array($degree_type, array('diploma', 'degree'), true) ? $degree_type : 'degree',
        'home_address' => $data['home_address'] ?? $data['homeAddress'] ?? '',
        'emergency_contact' => $data['emergency_contact'] ?? $data['emergencyContact'] ?? '',
        'emergency_contact_phone' => $data['emergency_contact_phone'] ?? '',
        'local_guardian' => $data['local_guardian'] ?? $data['localGuardian'] ?? '',
        'local_guardian_phone' => $data['local_guardian_phone'] ?? '',
        'passport_photo' => $data['passport_photo'] ?? $data['passportPhoto'] ?? ''
    );

    $result = registerStudent($user_id, $student);
    if ($result['success']) {
        return array('success' => true, 'student_id' => intval($result['student_id']), 'user_id' => $user_id);
    }
    return $result;
}

function updateStudentProfile($student_db_id, $data) {
    $conn = getDBConnection();
    ensureStudentColumns();

    $first_name = trim($data['first_name'] ?? '');
    $last_name = trim($data['last_name'] ?? '-');
    $student_id = trim($data['student_id'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $gender = $data['gender'] ?? 'male';
    $nationality = trim($data['nationality'] ?? '');
    $school = trim($data['school'] ?? '');
    $course = trim($data['course'] ?? '');
    $year_of_study = trim($data['year_of_study'] ?? '');
    $semester = trim($data['semester'] ?? '');
    $degree_type = $data['degree_type'] ?? 'degree';
    $passport_photo = trim($data['passport_photo'] ?? '');
    $home_address = trim($data['home_address'] ?? '');
    $emergency_contact = trim($data['emergency_contact'] ?? '');
    $local_guardian = trim($data['local_guardian'] ?? '');

    if ($first_name === '' || $student_id === '' || $email === '' || $phone === '') {
        return array('success' => false, 'error' => 'Full name, student ID, email, and phone are required');
    }

    if (!in_array($gender, array('male', 'female', 'other'), true)) {
        $gender = 'male';
    }
    if (!in_array($degree_type, array('diploma', 'degree'), true)) {
        $degree_type = 'degree';
    }
    $academic_validation = validateAcademicSelection($school, $course, $year_of_study, $semester);
    if (!$academic_validation['success']) {
        return $academic_validation;
    }

    $remove_photo = isset($data['remove_photo']) && in_array((string)$data['remove_photo'], array('1', 'true', 'yes'), true);
    $has_photo_update = $passport_photo !== '' || $remove_photo;
    $photo_sql = $has_photo_update ? ", passport_photo = ?" : "";
    if ($remove_photo) {
        $passport_photo = '';
    }
    $sql = "UPDATE students
            SET first_name = ?, last_name = ?, student_id = ?, email = ?, phone = ?,
                gender = ?, nationality = ?, school = ?, course = ?, year_of_study = ?, semester = ?, degree_type = ?,
                home_address = ?, emergency_contact = ?, local_guardian = ?$photo_sql
            WHERE id = ?";

    $stmt = $conn->prepare($sql);
    if ($has_photo_update) {
        $stmt->bind_param(
            "ssssssssssssssssi",
            $first_name,
            $last_name,
            $student_id,
            $email,
            $phone,
            $gender,
            $nationality,
            $school,
            $course,
            $year_of_study,
            $semester,
            $degree_type,
            $home_address,
            $emergency_contact,
            $local_guardian,
            $passport_photo,
            $student_db_id
        );
    } else {
        $stmt->bind_param(
            "sssssssssssssssi",
            $first_name,
            $last_name,
            $student_id,
            $email,
            $phone,
            $gender,
            $nationality,
            $school,
            $course,
            $year_of_study,
            $semester,
            $degree_type,
            $home_address,
            $emergency_contact,
            $local_guardian,
            $student_db_id
        );
    }

    if (!$stmt->execute()) {
        return array('success' => false, 'error' => $stmt->error);
    }

    $student = getStudentByIdentifier($student_id);
    if ($student && isset($student['user_id'])) {
        $user_id = intval($student['user_id']);
        $stmt_user = $conn->prepare("UPDATE users SET email = ? WHERE id = ?");
        $stmt_user->bind_param("si", $email, $user_id);
        $stmt_user->execute();
    }

    return array('success' => true);
}

function getAllStudents() {
    return fetchAll("SELECT s.*, u.id AS user_id, u.username, u.role, u.status AS user_status
                     FROM students s
                     LEFT JOIN users u ON s.user_id = u.id
                     ORDER BY s.first_name ASC");
}

function updateStudentStatus($student_db_id, $status) {
    $conn = getDBConnection();
    $student_db_id = intval($student_db_id);
    $status = strtolower(trim($status));
    if (!in_array($status, array('active', 'pending', 'inactive'), true)) {
        return array('success' => false, 'error' => 'Invalid student status');
    }

    $stmt_find = $conn->prepare("SELECT user_id FROM students WHERE id = ?");
    $stmt_find->bind_param("i", $student_db_id);
    $stmt_find->execute();
    $student = $stmt_find->get_result()->fetch_assoc();
    if ($student && isset($student['user_id'])) {
        $user = getUserById(intval($student['user_id']));
        if ($status === 'active' && !empty($user) && !in_array($user['role'], array('student', 'admin'), true)) {
            return array('success' => false, 'error' => 'Special roles must be approved by the main admin from Role Requests.');
        }
    }

    $stmt = $conn->prepare("UPDATE students SET membership_status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $student_db_id);
    if (!$stmt->execute()) {
        return array('success' => false, 'error' => $stmt->error);
    }

    if ($student && isset($student['user_id'])) {
        $user_status = $status === 'active' ? 'active' : 'inactive';
        $stmt_user = $conn->prepare("UPDATE users SET status = ? WHERE id = ?");
        $stmt_user->bind_param("si", $user_status, $student['user_id']);
        $stmt_user->execute();
    }

    return array('success' => true);
}

function deleteStudentRecord($student_db_id) {
    $conn = getDBConnection();
    $student_db_id = intval($student_db_id);
    $stmt_find = $conn->prepare("SELECT user_id, passport_photo FROM students WHERE id = ?");
    $stmt_find->bind_param("i", $student_db_id);
    $stmt_find->execute();
    $student = $stmt_find->get_result()->fetch_assoc();
    if (!$student) {
        return array('success' => false, 'error' => 'Student not found');
    }

    $stmt = $conn->prepare("DELETE FROM students WHERE id = ?");
    $stmt->bind_param("i", $student_db_id);
    if (!$stmt->execute()) {
        return array('success' => false, 'error' => $stmt->error);
    }

    if (!empty($student['user_id'])) {
        $stmt_user = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt_user->bind_param("i", $student['user_id']);
        $stmt_user->execute();
    }

    return array('success' => true);
}

// ============================================
// EVENT OPERATIONS
// ============================================

function createActivity($data) {
    ensureActivitiesTable();
    $conn = getDBConnection();

    $title = trim($data['title'] ?? '');
    $period = strtolower(trim($data['period'] ?? ''));
    $activity_date = trim($data['date'] ?? $data['activity_date'] ?? '');
    $activity_time = trim($data['time'] ?? $data['activity_time'] ?? '');
    $schedule_note = trim($data['schedule'] ?? $data['schedule_note'] ?? '');
    $location = trim($data['location'] ?? '');
    $description = trim($data['description'] ?? '');
    $created_by = isset($data['created_by']) ? intval($data['created_by']) : 0;

    if ($title === '' || !in_array($period, array('daily', 'weekly', 'monthly'), true) || $activity_date === '' || $activity_time === '' || $location === '' || $description === '') {
        return array('success' => false, 'error' => 'Title, period, date, time, location, and description are required.');
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $activity_date)) {
        return array('success' => false, 'error' => 'Please provide a valid activity date.');
    }
    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $activity_time)) {
        return array('success' => false, 'error' => 'Please provide a valid activity time.');
    }
    if ($created_by > 0 && !getUserById($created_by)) {
        $created_by = 0;
    }
    $created_by_value = $created_by > 0 ? $created_by : null;

    $stmt = $conn->prepare("INSERT INTO activities (title, period, activity_date, activity_time, schedule_note, location, description, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')");
    if (!$stmt) {
        return array('success' => false, 'error' => $conn->error);
    }
    $stmt->bind_param("sssssssi", $title, $period, $activity_date, $activity_time, $schedule_note, $location, $description, $created_by_value);

    if ($stmt->execute()) {
        return array('success' => true, 'activity_id' => $conn->insert_id);
    }
    return array('success' => false, 'error' => $stmt->error);
}

function getActivities($include_inactive = false) {
    ensureActivitiesTable();
    $where = $include_inactive ? '' : "WHERE a.status = 'active'";
    return fetchAll("SELECT a.*, u.username AS created_by_name
                     FROM activities a
                     LEFT JOIN users u ON a.created_by = u.id
                     {$where}
                     ORDER BY a.activity_date ASC, a.activity_time ASC, a.created_at DESC");
}

function deleteActivityRecord($activity_id) {
    ensureActivitiesTable();
    $conn = getDBConnection();
    $activity_id = intval($activity_id);
    if ($activity_id <= 0) {
        return array('success' => false, 'error' => 'Activity ID required.');
    }

    $stmt = $conn->prepare("DELETE FROM activities WHERE id = ?");
    if (!$stmt) {
        return array('success' => false, 'error' => $conn->error);
    }
    $stmt->bind_param("i", $activity_id);
    if ($stmt->execute()) {
        return array('success' => true);
    }
    return array('success' => false, 'error' => $stmt->error);
}

function createEvent($data) {
    $conn = getDBConnection();
    $category = isset($data['category']) ? $data['category'] : 'general';
    $organizer_id = isset($data['organizer_id']) && $data['organizer_id'] !== '' ? intval($data['organizer_id']) : null;
    if ($organizer_id !== null && !getUserById($organizer_id)) {
        $organizer_id = null;
    }
    $status = isset($data['status']) && in_array($data['status'], array('upcoming', 'ongoing', 'completed', 'cancelled'), true) ? $data['status'] : 'upcoming';
    $max_participants = isset($data['max_participants']) ? intval($data['max_participants']) : 100;
    
    $sql = "INSERT INTO events 
            (title, description, event_date, location, category, organizer_id, status, max_participants)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssisi",
        $data['title'],
        $data['description'],
        $data['event_date'],
        $data['location'],
        $category,
        $organizer_id,
        $status,
        $max_participants
    );
    
    if ($stmt->execute()) {
        return array('success' => true, 'event_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getUpcomingEvents($limit = 10) {
    $conn = getDBConnection();
    seedDefaultEventsIfEmpty();
    $sql = "SELECT * FROM events WHERE status IN ('upcoming', 'ongoing')
            ORDER BY event_date ASC LIMIT ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $limit);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function seedDefaultEventsIfEmpty() {
    if (countRows('events') > 0) {
        return;
    }

    $events = array(
        array(
            'title' => "Dawa'ah Orientation Program",
            'description' => "Welcome session for new and returning members with introduction to Dawa'ah activities.",
            'event_date' => date('Y-m-d H:i:s', strtotime('+7 days 10:00')),
            'location' => 'College Mosque Hall',
            'category' => 'orientation',
            'organizer_id' => null,
            'status' => 'upcoming',
            'max_participants' => 100
        ),
        array(
            'title' => 'Weekly Quran Circle',
            'description' => 'Group Quran recitation, reflection, and short reminders for students.',
            'event_date' => date('Y-m-d H:i:s', strtotime('+10 days 16:00')),
            'location' => 'Islamic Resource Room',
            'category' => 'quran',
            'organizer_id' => null,
            'status' => 'upcoming',
            'max_participants' => 60
        ),
        array(
            'title' => 'Welfare Support Meeting',
            'description' => 'A welfare session for students who need support, counseling, or guidance.',
            'event_date' => date('Y-m-d H:i:s', strtotime('+14 days 13:00')),
            'location' => 'Student Affairs Office',
            'category' => 'welfare',
            'organizer_id' => null,
            'status' => 'upcoming',
            'max_participants' => 40
        )
    );

    foreach ($events as $event) {
        createEvent($event);
    }
}

function registerEventAttendee($event_id, $student_id) {
    $conn = getDBConnection();
    
    $sql = "INSERT INTO event_registrations (event_id, student_id, status)
            VALUES (?, ?, 'registered')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $event_id, $student_id);
    
    if ($stmt->execute()) {
        // Update current participants count
        $update_sql = "UPDATE events SET current_participants = current_participants + 1 WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("i", $event_id);
        $update_stmt->execute();
        
        return array('success' => true);
    } else {
        if ($conn->errno === 1062) {
            return array('success' => true, 'already_registered' => true);
        }
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getEventRegistrations($event_id = 0) {
    if (!tableExists('event_registrations')) {
        return array();
    }

    $conn = getDBConnection();
    $where = '';
    if (intval($event_id) > 0) {
        $where = 'WHERE er.event_id = ' . intval($event_id);
    }

    $sql = "SELECT er.id, er.event_id, er.student_id, er.registered_at, er.status,
                   e.title AS event_title, e.event_date, e.location,
                   s.first_name, s.last_name, s.student_id AS student_number, s.email, s.phone
            FROM event_registrations er
            JOIN events e ON er.event_id = e.id
            JOIN students s ON er.student_id = s.id
            $where
            ORDER BY er.registered_at DESC";

    $result = $conn->query($sql);
    if ($result) {
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    return array();
}

// ============================================
// PRAYER TIMES OPERATIONS
// ============================================

function getPrayerTimes($date = null) {
    if ($date === null) {
        $date = date('Y-m-d');
    }
    
    $sql = "SELECT * FROM prayer_times WHERE date = ?";
    $conn = getDBConnection();
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $date);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function setPrayerTimes($date, $times) {
    $conn = getDBConnection();
    
    $sql = "INSERT INTO prayer_times 
            (date, fajr, dhuhr, asr, maghrib, isha, iqamah_fajr, iqamah_dhuhr, iqamah_asr, iqamah_maghrib, iqamah_isha, jummah_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            fajr = VALUES(fajr), dhuhr = VALUES(dhuhr), asr = VALUES(asr), 
            maghrib = VALUES(maghrib), isha = VALUES(isha),
            iqamah_fajr = VALUES(iqamah_fajr), iqamah_dhuhr = VALUES(iqamah_dhuhr),
            iqamah_asr = VALUES(iqamah_asr), iqamah_maghrib = VALUES(iqamah_maghrib),
            iqamah_isha = VALUES(iqamah_isha), jummah_time = VALUES(jummah_time)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "ssssssssssss",
        $date,
        $times['fajr'],
        $times['dhuhr'],
        $times['asr'],
        $times['maghrib'],
        $times['isha'],
        $times['iqamah_fajr'],
        $times['iqamah_dhuhr'],
        $times['iqamah_asr'],
        $times['iqamah_maghrib'],
        $times['iqamah_isha'],
        $times['jummah_time']
    );
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

// ============================================
// WELFARE OPERATIONS
// ============================================

function createWelfareRequest($student_id, $category, $description, $amount) {
    $conn = getDBConnection();
    
    $sql = "INSERT INTO welfare_requests 
            (student_id, category, description, amount_needed, status)
            VALUES (?, ?, ?, ?, 'pending')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issd", $student_id, $category, $description, $amount);
    
    if ($stmt->execute()) {
        return array('success' => true, 'request_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function approveWelfareRequest($request_id, $approved_by, $notes = '') {
    $conn = getDBConnection();
    
    $sql = "UPDATE welfare_requests 
            SET status = 'approved', approved_by = ?, approval_date = NOW(), notes = ?
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isi", $approved_by, $notes, $request_id);
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getPendingWelfareRequests() {
    return fetchAll("SELECT wr.*, s.first_name, s.last_name, s.student_id 
                     FROM welfare_requests wr 
                     JOIN students s ON wr.student_id = s.id 
                     WHERE wr.status = 'pending' 
                     ORDER BY wr.created_at DESC");
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

function ensureTransactionColumns() {
    $conn = getDBConnection();
    $conn->query("ALTER TABLE payments MODIFY status ENUM('pending', 'completed', 'failed', 'rejected', 'late', 'waived') DEFAULT 'pending'");
    $conn->query("ALTER TABLE donations MODIFY status ENUM('pending', 'completed', 'failed', 'rejected') DEFAULT 'pending'");

    $payment_columns = array(
        'receipt_number' => "ALTER TABLE payments ADD COLUMN receipt_number VARCHAR(100) NULL AFTER transaction_id",
        'approved_by' => "ALTER TABLE payments ADD COLUMN approved_by INT NULL AFTER receipt_number"
    );
    foreach ($payment_columns as $column => $sql) {
        $result = $conn->query("SHOW COLUMNS FROM payments LIKE '{$column}'");
        if (!$result || $result->num_rows === 0) {
            $conn->query($sql);
        }
    }

    $donation_columns = array(
        'receipt_number' => "ALTER TABLE donations ADD COLUMN receipt_number VARCHAR(100) NULL AFTER receipt_issued",
        'approved_by' => "ALTER TABLE donations ADD COLUMN approved_by INT NULL AFTER receipt_number"
    );
    foreach ($donation_columns as $column => $sql) {
        $result = $conn->query("SHOW COLUMNS FROM donations LIKE '{$column}'");
        if (!$result || $result->num_rows === 0) {
            $conn->query($sql);
        }
    }
}

function generateReceiptNumber($prefix, $record_id) {
    return $prefix . '-' . str_pad((string)intval($record_id), 5, '0', STR_PAD_LEFT) . '-' . date('YmdHis');
}

function transactionReferenceExists($table, $transaction_id, $exclude_id = 0) {
    $transaction_id = trim((string)$transaction_id);
    if ($transaction_id === '') {
        return false;
    }
    $conn = getDBConnection();
    $exclude_id = intval($exclude_id);
    $sql = "SELECT id FROM {$table} WHERE transaction_id = ?";
    if ($exclude_id > 0) {
        $sql .= " AND id <> ?";
    }
    $sql .= " LIMIT 1";
    $stmt = $conn->prepare($sql);
    if ($exclude_id > 0) {
        $stmt->bind_param("si", $transaction_id, $exclude_id);
    } else {
        $stmt->bind_param("s", $transaction_id);
    }
    $stmt->execute();
    return $stmt->get_result()->num_rows > 0;
}

function recordPayment($student_id, $payment_type, $amount, $due_date, $payment_method = null, $transaction_id = null, $notes = null, $status = 'completed') {
    $conn = getDBConnection();
    ensureTransactionColumns();
    $status = strtolower(trim($status));
    $status = in_array($status, array('pending', 'completed', 'failed', 'rejected', 'late', 'waived'), true) ? $status : 'completed';
    if (transactionReferenceExists('payments', $transaction_id)) {
        return array('success' => false, 'error' => 'This payment transaction reference already exists.');
    }
    
    $sql = "INSERT INTO payments 
            (student_id, payment_type, amount, due_date, payment_method, transaction_id, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isdsssss", $student_id, $payment_type, $amount, $due_date, $payment_method, $transaction_id, $notes, $status);
    
    if ($stmt->execute()) {
        $payment_id = $conn->insert_id;
        if ($status === 'completed') {
            completePayment($payment_id, $transaction_id);
        }
        return array('success' => true, 'payment_id' => $payment_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function completePayment($payment_id, $transaction_id = null, $approved_by = null) {
    $conn = getDBConnection();
    ensureTransactionColumns();
    $payment_id = intval($payment_id);
    if ($payment_id <= 0) {
        return array('success' => false, 'error' => 'Payment ID required');
    }
    if (transactionReferenceExists('payments', $transaction_id, $payment_id)) {
        return array('success' => false, 'error' => 'This payment transaction reference already exists.');
    }
    $receipt_number = generateReceiptNumber('RCP', $payment_id);
    $approved_by = $approved_by ? intval($approved_by) : null;
    
    $sql = "UPDATE payments 
            SET status = 'completed', paid_date = NOW(), transaction_id = COALESCE(?, transaction_id), receipt_number = COALESCE(receipt_number, ?), approved_by = COALESCE(?, approved_by)
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssii", $transaction_id, $receipt_number, $approved_by, $payment_id);
    
    if ($stmt->execute()) {
        return array('success' => true, 'receipt_number' => $receipt_number);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getPaymentRecordsForTreasurer() {
    ensureTransactionColumns();
    if (!tableExists('payments')) {
        return array();
    }
    $conn = getDBConnection();
    $sql = "SELECT p.id, s.student_id, s.first_name, s.last_name, s.email,
                   p.payment_type, p.amount, p.status, p.payment_method,
                   p.transaction_id, p.receipt_number, p.notes, p.created_at, p.paid_date,
                   u.username AS approved_by
            FROM payments p
            LEFT JOIN students s ON p.student_id = s.id
            LEFT JOIN users u ON p.approved_by = u.id
            ORDER BY FIELD(p.status, 'pending', 'failed', 'rejected', 'late', 'waived', 'completed'), p.created_at DESC
            LIMIT 200";
    $result = $conn->query($sql);
    return $result ? $result->fetch_all(MYSQLI_ASSOC) : array();
}

// ============================================
// DONATION OPERATIONS
// ============================================

function recordDonation($donor_id, $donor_name, $donor_email, $amount, $donation_type, $purpose, $payment_method = null, $transaction_id = null, $status = 'completed') {
    $conn = getDBConnection();
    ensureTransactionColumns();
    $donor_id = intval($donor_id) > 0 && getUserById(intval($donor_id)) ? intval($donor_id) : null;
    $status = strtolower(trim($status));
    $status = in_array($status, array('pending', 'completed', 'failed', 'rejected'), true) ? $status : 'completed';
    if (transactionReferenceExists('donations', $transaction_id)) {
        return array('success' => false, 'error' => 'This donation transaction reference already exists.');
    }
    $receipt_issued = $status === 'completed' ? 1 : 0;
    
    $sql = "INSERT INTO donations 
            (donor_id, donor_name, donor_email, amount, donation_type, purpose, payment_method, transaction_id, status, receipt_issued)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issdsssssi", $donor_id, $donor_name, $donor_email, $amount, $donation_type, $purpose, $payment_method, $transaction_id, $status, $receipt_issued);
    
    if ($stmt->execute()) {
        $donation_id = $conn->insert_id;
        if ($status === 'completed') {
            completeDonation($donation_id, $transaction_id);
        }
        return array('success' => true, 'donation_id' => $donation_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getTotalDonations($year = null) {
    if ($year === null) {
        $year = date('Y');
    }
    
    $sql = "SELECT SUM(amount) as total FROM donations 
            WHERE YEAR(created_at) = ? AND status = 'completed'";
    $conn = getDBConnection();
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $year);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

// ============================================
// LEADERSHIP OPERATIONS
// ============================================

function assignLeadershipRole($student_id, $position, $department, $start_date) {
    $conn = getDBConnection();
    
    $sql = "INSERT INTO leadership_roles 
            (student_id, position, department, start_date, status)
            VALUES (?, ?, ?, ?, 'active')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isss", $student_id, $position, $department, $start_date);
    
    if ($stmt->execute()) {
        return array('success' => true, 'role_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getCurrentLeadership() {
    return fetchAll("SELECT lr.*, s.first_name, s.last_name, s.student_id, u.email
                     FROM leadership_roles lr
                     JOIN students s ON lr.student_id = s.id
                     JOIN users u ON s.user_id = u.id
                     WHERE lr.status = 'active'
                     ORDER BY lr.position");
}

// ============================================
// ANNOUNCEMENT OPERATIONS
// ============================================

function createAnnouncement($title, $content, $author_id, $priority = 'medium', $expires_at = null) {
    $conn = getDBConnection();
    if ($priority === 'normal') {
        $priority = 'medium';
    }
    if (!in_array($priority, array('low', 'medium', 'high', 'urgent'), true)) {
        $priority = 'medium';
    }
    $author_id = intval($author_id);
    if ($author_id <= 0 || !getUserById($author_id)) {
        $fallback = $conn->query("SELECT id FROM users WHERE role IN ('admin', 'executive') ORDER BY id ASC LIMIT 1");
        if ($fallback && $fallback->num_rows > 0) {
            $author_id = intval($fallback->fetch_assoc()['id']);
        }
    }

    if ($author_id <= 0) {
        $password = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);
        $stmt_user = $conn->prepare("INSERT INTO users (username, email, password, role, status) VALUES ('system_admin', 'admin@dawaah.local', ?, 'admin', 'active')");
        $stmt_user->bind_param("s", $password);
        if ($stmt_user->execute()) {
            $author_id = $conn->insert_id;
        } else {
            $fallback = $conn->query("SELECT id FROM users WHERE username = 'system_admin' LIMIT 1");
            if ($fallback && $fallback->num_rows > 0) {
                $author_id = intval($fallback->fetch_assoc()['id']);
            }
        }
    }

    if ($author_id <= 0) {
        return array('success' => false, 'error' => 'Could not create or find an admin user for this announcement.');
    }
    
    $sql = "INSERT INTO announcements 
            (title, content, author_id, priority, expires_at)
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssiss", $title, $content, $author_id, $priority, $expires_at);
    
    if ($stmt->execute()) {
        return array('success' => true, 'announcement_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getActiveAnnouncements() {
    return fetchAll("SELECT a.*, u.username as author_name 
                     FROM announcements a
                     LEFT JOIN users u ON a.author_id = u.id
                     WHERE (a.expires_at IS NULL OR a.expires_at > NOW())
                     ORDER BY a.priority DESC, a.published_at DESC");
}

// ============================================
// VOLUNTEER OPERATIONS
// ============================================

function createVolunteerOpportunity($title, $description, $required_hours, $start_date, $end_date, $created_by, $duration = '') {
    ensureVolunteerTables();
    $conn = getDBConnection();
    
    $sql = "INSERT INTO volunteer_opportunities 
            (title, description, required_hours, duration, start_date, end_date, created_by, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssisssi", $title, $description, $required_hours, $duration, $start_date, $end_date, $created_by);
    
    if ($stmt->execute()) {
        return array('success' => true, 'opportunity_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function registerVolunteer($opportunity_id, $student_id, $skills = '', $availability = '') {
    ensureVolunteerTables();
    $conn = getDBConnection();
    
    $sql = "INSERT INTO volunteer_registrations 
            (volunteer_opportunity_id, student_id, skills, availability, status)
            VALUES (?, ?, ?, ?, 'registered')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiss", $opportunity_id, $student_id, $skills, $availability);
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

// ============================================
// PUBLIC LEADERSHIP MANAGEMENT
// ============================================

function addPublicLeader($leader_data) {
    $conn = getDBConnection();
    $user_id = isset($leader_data['user_id']) && intval($leader_data['user_id']) > 0 ? intval($leader_data['user_id']) : null;
    if ($user_id !== null && !getUserById($user_id)) {
        $user_id = null;
    }
    
    // Check if leadership_profiles table exists, if not create it
    $create_table = "CREATE TABLE IF NOT EXISTS leadership_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        course VARCHAR(150),
        year_of_study VARCHAR(50),
        bio TEXT,
        description TEXT,
        email VARCHAR(100),
        phone VARCHAR(20),
        photo_url VARCHAR(255),
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )";
    $conn->query($create_table);
    ensureLeadershipProfileColumns();
    
    $sql = "INSERT INTO leadership_profiles 
            (name, position, course, year_of_study, bio, description, email, phone, photo_url, user_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')";
    
    $stmt = $conn->prepare($sql);
    $name = $leader_data['name'];
    $position = $leader_data['position'];
    $course = $leader_data['course'] ?? '';
    $year_of_study = $leader_data['year_of_study'] ?? '';
    $bio = $leader_data['bio'];
    $description = $leader_data['description'];
    $email = $leader_data['email'];
    $phone = $leader_data['phone'];
    $photo_url = $leader_data['photo_url'];
    $stmt->bind_param(
        "sssssssssi",
        $name,
        $position,
        $course,
        $year_of_study,
        $bio,
        $description,
        $email,
        $phone,
        $photo_url,
        $user_id
    );
    
    if ($stmt->execute()) {
        return array('success' => true, 'leader_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function ensureVolunteerTables() {
    $conn = getDBConnection();
    $conn->query("CREATE TABLE IF NOT EXISTS volunteer_opportunities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        required_hours INT,
        duration VARCHAR(100),
        start_date DATE,
        end_date DATE,
        created_by INT,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )");
    $conn->query("CREATE TABLE IF NOT EXISTS volunteer_registrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        volunteer_opportunity_id INT NOT NULL,
        student_id INT NOT NULL,
        skills TEXT,
        availability VARCHAR(255),
        hours_completed INT DEFAULT 0,
        status ENUM('registered', 'in-progress', 'completed') DEFAULT 'registered',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        UNIQUE KEY unique_volunteer_reg (volunteer_opportunity_id, student_id),
        FOREIGN KEY (volunteer_opportunity_id) REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )");
    ensureColumn('volunteer_registrations', 'skills', "ALTER TABLE volunteer_registrations ADD COLUMN skills TEXT AFTER student_id");
    ensureColumn('volunteer_registrations', 'availability', "ALTER TABLE volunteer_registrations ADD COLUMN availability VARCHAR(255) AFTER skills");
}

function getVolunteerOpportunitiesFromDb($include_inactive = false) {
    ensureVolunteerTables();
    $where = $include_inactive ? '' : "WHERE vo.status = 'active'";
    return fetchAll("SELECT vo.*, u.username AS created_by_name,
                            COUNT(vr.id) AS signup_count
                     FROM volunteer_opportunities vo
                     LEFT JOIN users u ON vo.created_by = u.id
                     LEFT JOIN volunteer_registrations vr ON vr.volunteer_opportunity_id = vo.id
                     {$where}
                     GROUP BY vo.id
                     ORDER BY vo.created_at DESC");
}

function getVolunteerRegistrationsFromDb($student_id = 0) {
    ensureVolunteerTables();
    $student_id = intval($student_id);
    if ($student_id > 0) {
        $stmt = getDBConnection()->prepare("SELECT vr.*, vo.title AS opportunity_title, vo.required_hours,
                                                   s.first_name, s.last_name, s.student_id AS student_number, s.email
                                            FROM volunteer_registrations vr
                                            JOIN volunteer_opportunities vo ON vr.volunteer_opportunity_id = vo.id
                                            JOIN students s ON vr.student_id = s.id
                                            WHERE vr.student_id = ?
                                            ORDER BY vr.registered_at DESC");
        $stmt->bind_param("i", $student_id);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }
    return fetchAll("SELECT vr.*, vo.title AS opportunity_title, vo.required_hours,
                            s.first_name, s.last_name, s.student_id AS student_number, s.email
                     FROM volunteer_registrations vr
                     JOIN volunteer_opportunities vo ON vr.volunteer_opportunity_id = vo.id
                     JOIN students s ON vr.student_id = s.id
                     ORDER BY vr.registered_at DESC");
}

function updateVolunteerRegistrationStatus($registration_id, $status, $hours_completed = null) {
    ensureVolunteerTables();
    $conn = getDBConnection();
    $registration_id = intval($registration_id);
    if (!in_array($status, array('registered', 'in-progress', 'completed'), true)) {
        return array('success' => false, 'error' => 'Invalid volunteer status.');
    }
    $hours_completed = $hours_completed === null ? null : intval($hours_completed);
    $completed_at_sql = $status === 'completed' ? ", completed_at = NOW()" : "";
    if ($hours_completed === null) {
        $stmt = $conn->prepare("UPDATE volunteer_registrations SET status = ? {$completed_at_sql} WHERE id = ?");
        $stmt->bind_param("si", $status, $registration_id);
    } else {
        $stmt = $conn->prepare("UPDATE volunteer_registrations SET status = ?, hours_completed = ? {$completed_at_sql} WHERE id = ?");
        $stmt->bind_param("sii", $status, $hours_completed, $registration_id);
    }
    if ($stmt->execute()) {
        return array('success' => true);
    }
    return array('success' => false, 'error' => $stmt->error);
}

function updatePaymentStatus($payment_id, $status, $transaction_id = null, $notes = null, $approved_by = null) {
    $conn = getDBConnection();
    ensureTransactionColumns();
    $status = strtolower(trim($status));
    if (!in_array($status, array('pending', 'completed', 'failed', 'rejected', 'late', 'waived'), true)) {
        return array('success' => false, 'error' => 'Invalid payment status');
    }
    $payment_id = intval($payment_id);
    $approved_by = $approved_by ? intval($approved_by) : null;
    if (transactionReferenceExists('payments', $transaction_id, $payment_id)) {
        return array('success' => false, 'error' => 'This payment transaction reference already exists.');
    }
    $receipt_number = $status === 'completed' ? generateReceiptNumber('RCP', $payment_id) : null;

    $sql = "UPDATE payments
            SET status = ?,
                paid_date = CASE WHEN ? = 'completed' THEN NOW() ELSE paid_date END,
                transaction_id = COALESCE(?, transaction_id),
                receipt_number = CASE WHEN ? = 'completed' THEN COALESCE(receipt_number, ?) ELSE receipt_number END,
                notes = COALESCE(?, notes),
                approved_by = CASE WHEN ? <> 'pending' THEN COALESCE(?, approved_by) ELSE approved_by END
            WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssii", $status, $status, $transaction_id, $status, $receipt_number, $notes, $status, $approved_by, $payment_id);

    if ($stmt->execute()) {
        return array('success' => true);
    }
    return array('success' => false, 'error' => $stmt->error);
}

function getPublicLeaders() {
    $conn = getDBConnection();
    ensureLeadershipProfileColumns();
    
    $sql = "SELECT * FROM leadership_profiles 
            WHERE status = 'active' 
            ORDER BY position, name ASC";
    
    $result = $conn->query($sql);
    if ($result) {
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    return array();
}

function deletePublicLeader($leader_id) {
    $conn = getDBConnection();
    
    $sql = "DELETE FROM leadership_profiles WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $leader_id);
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

// ============================================
// GALLERY MANAGEMENT
// ============================================

function addGalleryItem($gallery_data) {
    $conn = getDBConnection();
    $uploaded_by = isset($gallery_data['uploaded_by']) && intval($gallery_data['uploaded_by']) > 0 ? intval($gallery_data['uploaded_by']) : null;
    $media_type = isset($gallery_data['media_type']) && $gallery_data['media_type'] === 'video' ? 'video' : 'image';
    if ($uploaded_by !== null && !getUserById($uploaded_by)) {
        $uploaded_by = null;
    }
    
    // Check if gallery table exists, if not create it
    $create_table = "CREATE TABLE IF NOT EXISTS gallery (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        media_type ENUM('image', 'video') DEFAULT 'image',
        thumbnail_url VARCHAR(500),
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active',
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    )";
    $conn->query($create_table);
    ensureGalleryMediaTypeColumn();
    
    $sql = "INSERT INTO gallery 
            (title, description, image_url, media_type, uploaded_by, status)
            VALUES (?, ?, ?, ?, ?, 'active')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "ssssi",
        $gallery_data['title'],
        $gallery_data['description'],
        $gallery_data['image_url'],
        $media_type,
        $uploaded_by
    );
    
    if ($stmt->execute()) {
        return array('success' => true, 'gallery_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getGalleryItems() {
    $conn = getDBConnection();
    ensureGalleryMediaTypeColumn();
    $conn->query("UPDATE gallery SET image_url = 'uploads/gallery/sample-gallery.svg' WHERE image_url LIKE '%via.placeholder.com%' OR image_url = ''");
    
    $sql = "SELECT * FROM gallery 
            WHERE status = 'active' 
            ORDER BY created_at DESC";
    
    $result = $conn->query($sql);
    if ($result) {
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    return array();
}

function deleteGalleryItem($gallery_id) {
    $conn = getDBConnection();
    
    $sql = "DELETE FROM gallery WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $gallery_id);
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

if (!function_exists('fetchAll')) {
    function fetchAll($sql) {
        $conn = getDBConnection();
        $result = $conn->query($sql);
        if ($result) {
            return $result->fetch_all(MYSQLI_ASSOC);
        }
        return array();
    }
}

function ensureGalleryMediaTypeColumn() {
    $conn = getDBConnection();
    if (!tableExists('gallery')) {
        return;
    }

    $result = $conn->query("SHOW COLUMNS FROM gallery LIKE 'media_type'");
    if (!$result || $result->num_rows === 0) {
        $conn->query("ALTER TABLE gallery ADD COLUMN media_type ENUM('image', 'video') DEFAULT 'image' AFTER image_url");
    }
}

function completeDonation($donation_id, $transaction_id = null, $approved_by = null) {
    $conn = getDBConnection();
    ensureTransactionColumns();
    $donation_id = intval($donation_id);
    if ($donation_id <= 0) {
        return array('success' => false, 'error' => 'Donation ID required');
    }
    if (transactionReferenceExists('donations', $transaction_id, $donation_id)) {
        return array('success' => false, 'error' => 'This donation transaction reference already exists.');
    }
    $receipt_issued = 1;
    $receipt_number = generateReceiptNumber('DRT', $donation_id);
    $approved_by = $approved_by ? intval($approved_by) : null;

    $sql = "UPDATE donations
            SET status = 'completed', transaction_id = COALESCE(?, transaction_id), receipt_issued = ?, receipt_number = COALESCE(receipt_number, ?), approved_by = COALESCE(?, approved_by)
            WHERE id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sisii", $transaction_id, $receipt_issued, $receipt_number, $approved_by, $donation_id);

    if ($stmt->execute()) {
        return array('success' => true, 'receipt_number' => $receipt_number);
    }
    return array('success' => false, 'error' => $stmt->error);
}

function getDonationRecordsForTreasurer() {
    ensureTransactionColumns();
    if (!tableExists('donations')) {
        return array();
    }
    $conn = getDBConnection();
    $sql = "SELECT d.id, d.donor_name, d.donor_email, d.amount, d.donation_type,
                   d.purpose, d.payment_method, d.transaction_id, d.receipt_number,
                   d.status, d.receipt_issued, d.created_at,
                   u.username AS approved_by
            FROM donations d
            LEFT JOIN users u ON d.approved_by = u.id
            ORDER BY FIELD(d.status, 'pending', 'failed', 'rejected', 'completed'), d.created_at DESC
            LIMIT 200";
    $result = $conn->query($sql);
    return $result ? $result->fetch_all(MYSQLI_ASSOC) : array();
}

function updateDonationStatus($donation_id, $status, $transaction_id = null, $approved_by = null) {
    $conn = getDBConnection();
    ensureTransactionColumns();
    $status = strtolower(trim($status));
    if (!in_array($status, array('pending', 'completed', 'failed', 'rejected'), true)) {
        return array('success' => false, 'error' => 'Invalid donation status');
    }
    $donation_id = intval($donation_id);
    $approved_by = $approved_by ? intval($approved_by) : null;
    if (transactionReferenceExists('donations', $transaction_id, $donation_id)) {
        return array('success' => false, 'error' => 'This donation transaction reference already exists.');
    }
    $receipt_issued = $status === 'completed' ? 1 : 0;
    $receipt_number = $status === 'completed' ? generateReceiptNumber('DRT', $donation_id) : null;

    $sql = "UPDATE donations
            SET status = ?,
                transaction_id = COALESCE(?, transaction_id),
                receipt_issued = ?,
                receipt_number = CASE WHEN ? = 'completed' THEN COALESCE(receipt_number, ?) ELSE receipt_number END,
                approved_by = CASE WHEN ? <> 'pending' THEN COALESCE(?, approved_by) ELSE approved_by END
            WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssisssii", $status, $transaction_id, $receipt_issued, $status, $receipt_number, $status, $approved_by, $donation_id);

    if ($stmt->execute()) {
        return array('success' => true);
    }
    return array('success' => false, 'error' => $stmt->error);
}

function getAllWelfareRequests() {
    $conn = getDBConnection();
    $sql = "SELECT wr.*, wr.student_id AS student_db_id,
                   s.first_name, s.last_name, s.student_id AS student_number,
                   s.email, s.phone, s.course, s.year_of_study
            FROM welfare_requests wr
            LEFT JOIN students s ON wr.student_id = s.id
            ORDER BY wr.created_at DESC";
    $result = $conn->query($sql);
    if ($result) {
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    return array();
}

function ensureLeadershipProfileColumns() {
    $conn = getDBConnection();
    if (!tableExists('leadership_profiles')) {
        return;
    }

    $columns = array();
    $result = $conn->query("SHOW COLUMNS FROM leadership_profiles");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $columns[$row['Field']] = true;
        }
    }

    if (!isset($columns['course'])) {
        $conn->query("ALTER TABLE leadership_profiles ADD COLUMN course VARCHAR(150) NULL AFTER position");
    }
    if (!isset($columns['year_of_study'])) {
        $conn->query("ALTER TABLE leadership_profiles ADD COLUMN year_of_study VARCHAR(50) NULL AFTER course");
    }
}

function ensureStudentColumns() {
    $conn = getDBConnection();
    if (!tableExists('students')) {
        return;
    }

    $columns = array();
    $result = $conn->query("SHOW COLUMNS FROM students");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $columns[$row['Field']] = true;
        }
    }

    if (!isset($columns['school'])) {
        $conn->query("ALTER TABLE students ADD COLUMN school VARCHAR(150) NULL AFTER nationality");
    }
    if (!isset($columns['semester'])) {
        $conn->query("ALTER TABLE students ADD COLUMN semester VARCHAR(20) NULL AFTER year_of_study");
    }
    if (!isset($columns['passport_photo'])) {
        $conn->query("ALTER TABLE students ADD COLUMN passport_photo VARCHAR(255) NULL AFTER local_guardian_phone");
    }
}

function ensureActivitiesTable() {
    $conn = getDBConnection();
    $conn->query("CREATE TABLE IF NOT EXISTS activities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        period ENUM('daily', 'weekly', 'monthly') NOT NULL,
        activity_date DATE NOT NULL,
        activity_time TIME NOT NULL,
        schedule_note VARCHAR(255),
        location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_by INT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )");
}

function updateWelfareStatus($request_id, $status, $notes = '', $approved_by = 0) {
    $conn = getDBConnection();
    $status_map = array(
        'Approved' => 'approved',
        'Rejected' => 'rejected',
        'Completed' => 'completed',
        'Pending Review' => 'pending',
        'pending' => 'pending',
        'approved' => 'approved',
        'rejected' => 'rejected',
        'completed' => 'completed'
    );
    $db_status = isset($status_map[$status]) ? $status_map[$status] : 'pending';
    $approved_by = intval($approved_by) > 0 && getUserById(intval($approved_by)) ? intval($approved_by) : null;

    $sql = "UPDATE welfare_requests
            SET status = ?, approved_by = ?, approval_date = CASE WHEN ? IN ('approved', 'rejected') THEN NOW() ELSE approval_date END, notes = ?
            WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sissi", $db_status, $approved_by, $db_status, $notes, $request_id);
    if ($stmt->execute()) {
        return array('success' => true);
    }
    return array('success' => false, 'error' => $stmt->error);
}

function deleteEvent($event_id) {
    $conn = getDBConnection();
    
    $sql = "DELETE FROM events WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $event_id);
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function deleteAnnouncement($announcement_id) {
    $conn = getDBConnection();
    
    $sql = "DELETE FROM announcements WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $announcement_id);
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

// ============================================
// RESOURCE MANAGEMENT
// ============================================

function addResource($resource_data) {
    $conn = getDBConnection();
    $title = $resource_data['title'];
    $description = isset($resource_data['description']) ? $resource_data['description'] : '';
    $resource_type = isset($resource_data['resource_type']) ? $resource_data['resource_type'] : (isset($resource_data['type']) ? $resource_data['type'] : 'link');
    $file_path = isset($resource_data['file_path']) ? $resource_data['file_path'] : null;
    $url = isset($resource_data['url']) ? $resource_data['url'] : null;
    $category = isset($resource_data['category']) ? $resource_data['category'] : '';
    $uploaded_by = isset($resource_data['uploaded_by']) && intval($resource_data['uploaded_by']) > 0 ? intval($resource_data['uploaded_by']) : null;
    if ($uploaded_by !== null && !getUserById($uploaded_by)) {
        $uploaded_by = null;
    }

    $sql = "INSERT INTO resources (title, description, resource_type, file_path, url, category, uploaded_by, is_public)
            VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssi", $title, $description, $resource_type, $file_path, $url, $category, $uploaded_by);
    if ($stmt->execute()) {
        return array('success' => true, 'resource_id' => $conn->insert_id);
    }
    return array('success' => false, 'error' => $stmt->error);
}

function getResources() {
    $conn = getDBConnection();
    seedDefaultResourcesIfEmpty();
    $conn->query("UPDATE resources SET url = 'uploads/resources/student-welfare-support.html' WHERE title = 'Sample Student Resource'");
    $result = $conn->query("SELECT * FROM resources WHERE is_public = TRUE ORDER BY created_at DESC");
    if ($result) {
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    return array();
}

function seedDefaultResourcesIfEmpty() {
    $conn = getDBConnection();
    if (!tableExists('resources') || countRows('resources') > 0) {
        return;
    }

    $resources = array(
        array(
            'title' => 'Beginner Prayer Guide',
            'description' => 'A simple guide for learning daily salah steps, prayer times, and basic purification before prayer.',
            'resource_type' => 'article',
            'category' => 'Prayer',
            'url' => 'uploads/resources/beginner-prayer-guide.html'
        ),
        array(
            'title' => 'Quran Recitation Playlist',
            'description' => 'A sample video resource for Quran listening and recitation practice.',
            'resource_type' => 'video',
            'category' => 'Quran',
            'url' => 'uploads/resources/quran-recitation-sample.html'
        ),
        array(
            'title' => 'Student Welfare Support Information',
            'description' => "Information for members who need welfare support, counseling, or emergency assistance from Dawa'ah.",
            'resource_type' => 'link',
            'category' => 'Welfare',
            'url' => 'uploads/resources/student-welfare-support.html'
        )
    );

    foreach ($resources as $resource) {
        addResource($resource);
    }

    $conn->query("UPDATE resources SET url = 'uploads/resources/beginner-prayer-guide.html' WHERE title = 'Beginner Prayer Guide'");
    $conn->query("UPDATE resources SET url = 'uploads/resources/quran-recitation-sample.html' WHERE title = 'Quran Recitation Playlist'");
    $conn->query("UPDATE resources SET url = 'uploads/resources/student-welfare-support.html' WHERE title = 'Student Welfare Support Information'");
}

function deleteResource($resource_id) {
    $conn = getDBConnection();
    $stmt = $conn->prepare("DELETE FROM resources WHERE id = ?");
    $stmt->bind_param("i", $resource_id);
    if ($stmt->execute()) {
        return array('success' => true);
    }
    return array('success' => false, 'error' => $stmt->error);
}

// ============================================
// ADMIN DASHBOARD SUMMARY
// ============================================

function tableExists($table) {
    $conn = getDBConnection();
    $safe_table = $conn->real_escape_string($table);
    $result = $conn->query("SHOW TABLES LIKE '$safe_table'");
    return $result && $result->num_rows > 0;
}

function ensureColumn($table, $column, $alter_sql) {
    if (!tableExists($table)) {
        return;
    }
    $conn = getDBConnection();
    $safe_table = $conn->real_escape_string($table);
    $safe_column = $conn->real_escape_string($column);
    $result = $conn->query("SHOW COLUMNS FROM `$safe_table` LIKE '$safe_column'");
    if ($result && $result->num_rows === 0) {
        $conn->query($alter_sql);
    }
}

function countRows($table, $where = '1=1') {
    if (!tableExists($table)) {
        return 0;
    }
    $conn = getDBConnection();
    $result = $conn->query("SELECT COUNT(*) AS total FROM `$table` WHERE $where");
    if ($result) {
        $row = $result->fetch_assoc();
        return intval($row['total']);
    }
    return 0;
}

function sumColumn($table, $column, $where = '1=1') {
    if (!tableExists($table)) {
        return 0;
    }
    $conn = getDBConnection();
    $result = $conn->query("SELECT COALESCE(SUM(`$column`), 0) AS total FROM `$table` WHERE $where");
    if ($result) {
        $row = $result->fetch_assoc();
        return floatval($row['total']);
    }
    return 0;
}

function getAdminDashboardStats() {
    seedDefaultResourcesIfEmpty();
    ensureTransactionColumns();
    return array(
        'members' => countRows('users'),
        'students' => countRows('students'),
        'active_students' => countRows('students', "membership_status = 'active'"),
        'announcements' => countRows('announcements'),
        'events' => countRows('events'),
        'upcoming_events' => countRows('events', "event_date > NOW() AND status IN ('upcoming', 'ongoing')"),
        'welfare_requests' => countRows('welfare_requests'),
        'pending_welfare' => countRows('welfare_requests', "status = 'pending'"),
        'approved_welfare' => countRows('welfare_requests', "status = 'approved'"),
        'payments' => countRows('payments'),
        'pending_payments' => countRows('payments', "status = 'pending'"),
        'failed_payments' => countRows('payments', "status IN ('failed', 'rejected')"),
        'completed_payments' => countRows('payments', "status = 'completed'"),
        'payment_total' => sumColumn('payments', 'amount', "status = 'completed'"),
        'month_payment_total' => sumColumn('payments', 'amount', "status = 'completed' AND YEAR(COALESCE(paid_date, created_at)) = YEAR(CURDATE()) AND MONTH(COALESCE(paid_date, created_at)) = MONTH(CURDATE())"),
        'pending_payment_amount' => sumColumn('payments', 'amount', "status = 'pending'"),
        'failed_payment_amount' => sumColumn('payments', 'amount', "status IN ('failed', 'rejected')"),
        'donations' => countRows('donations'),
        'pending_donations' => countRows('donations', "status = 'pending'"),
        'failed_donations' => countRows('donations', "status IN ('failed', 'rejected')"),
        'completed_donations' => countRows('donations', "status = 'completed'"),
        'donation_total' => sumColumn('donations', 'amount', "status = 'completed'"),
        'month_donation_total' => sumColumn('donations', 'amount', "status = 'completed' AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())"),
        'pending_donation_amount' => sumColumn('donations', 'amount', "status = 'pending'"),
        'failed_donation_amount' => sumColumn('donations', 'amount', "status IN ('failed', 'rejected')"),
        'resources' => countRows('resources'),
        'gallery' => countRows('gallery'),
        'leaders' => countRows('leadership_profiles', "status = 'active'"),
        'hadiths' => countRows('hadiths'),
        'prayer_days' => countRows('prayer_times'),
        'volunteer_opportunities' => countRows('volunteer_opportunities')
    );
}

function getAdminDashboardDetail($type) {
    ensureTransactionColumns();
    if ($type === 'gallery' && tableExists('gallery')) {
        $conn = getDBConnection();
        $conn->query("UPDATE gallery SET image_url = 'uploads/gallery/sample-gallery.svg' WHERE image_url LIKE '%via.placeholder.com%' OR image_url = ''");
    }

    $queries = array(
        'members' => array('table' => 'users', 'sql' => "SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 100"),
        'students' => array('table' => 'students', 'sql' => "SELECT id, student_id, first_name, last_name, email, phone, course, year_of_study, semester, passport_photo, membership_status, created_at FROM students ORDER BY created_at DESC LIMIT 100"),
        'donations' => array('table' => 'donations', 'sql' => "SELECT d.id, d.donor_name, d.donor_email, d.amount, d.donation_type, d.purpose, d.payment_method, d.transaction_id, d.receipt_number, d.status, d.receipt_issued, u.username AS approved_by, d.created_at FROM donations d LEFT JOIN users u ON d.approved_by = u.id ORDER BY FIELD(d.status, 'pending', 'failed', 'rejected', 'completed'), d.created_at DESC LIMIT 100"),
        'payments' => array('table' => 'payments', 'sql' => "SELECT p.id, s.student_id, s.first_name, s.last_name, s.email, p.payment_type, p.amount, p.status, p.payment_method, p.transaction_id, p.receipt_number, p.notes, u.username AS approved_by, p.created_at FROM payments p LEFT JOIN students s ON p.student_id = s.id LEFT JOIN users u ON p.approved_by = u.id ORDER BY FIELD(p.status, 'pending', 'failed', 'rejected', 'late', 'waived', 'completed'), p.created_at DESC LIMIT 100"),
        'welfare' => array('table' => 'welfare_requests', 'sql' => "SELECT wr.id, s.student_id, s.first_name, s.last_name, wr.category, wr.amount_needed, wr.status, wr.created_at FROM welfare_requests wr LEFT JOIN students s ON wr.student_id = s.id ORDER BY wr.created_at DESC LIMIT 100"),
        'events' => array('table' => 'events', 'sql' => "SELECT id, title, event_date, location, status, max_participants, current_participants, created_at FROM events ORDER BY created_at DESC LIMIT 100"),
        'announcements' => array('table' => 'announcements', 'sql' => "SELECT id, title, priority, published_at, expires_at, created_at FROM announcements ORDER BY created_at DESC LIMIT 100"),
        'resources' => array('table' => 'resources', 'sql' => "SELECT id, title, resource_type, category, url, downloads, created_at FROM resources ORDER BY created_at DESC LIMIT 100"),
        'gallery' => array('table' => 'gallery', 'sql' => "SELECT id, title, description, image_url, media_type, created_at FROM gallery ORDER BY created_at DESC LIMIT 100"),
        'leadership' => array('table' => 'leadership_profiles', 'sql' => "SELECT id, name, position, email, phone, status, created_at FROM leadership_profiles ORDER BY created_at DESC LIMIT 100"),
        'hadiths' => array('table' => 'hadiths', 'sql' => "SELECT id, reference, source, category, created_at FROM hadiths ORDER BY created_at DESC LIMIT 100"),
        'prayer' => array('table' => 'prayer_times', 'sql' => "SELECT id, date, fajr, dhuhr, asr, maghrib, isha, jummah_time, updated_at FROM prayer_times ORDER BY date DESC LIMIT 100")
    );

    if (!isset($queries[$type])) {
        return array('success' => false, 'error' => 'Unknown dashboard detail type');
    }

    if (!tableExists($queries[$type]['table'])) {
        return array('success' => true, 'type' => $type, 'rows' => array());
    }

    $conn = getDBConnection();
    $result = $conn->query($queries[$type]['sql']);
    if ($result) {
        return array('success' => true, 'type' => $type, 'rows' => $result->fetch_all(MYSQLI_ASSOC));
    }
    return array('success' => false, 'error' => $conn->error);
}

function ensureSystemAdminUser() {
    $conn = getDBConnection();
    $result = $conn->query("SELECT id FROM users WHERE username = 'system_admin' LIMIT 1");
    if ($result && $result->num_rows > 0) {
        return intval($result->fetch_assoc()['id']);
    }

    $password = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, role, status) VALUES ('system_admin', 'admin@dawaah.local', ?, 'admin', 'active')");
    $stmt->bind_param("s", $password);
    if ($stmt->execute()) {
        return $conn->insert_id;
    }
    return 0;
}

function seedAdminSampleData() {
    $admin_id = ensureSystemAdminUser();
    if ($admin_id <= 0) {
        return array('success' => false, 'error' => 'Could not create system admin user');
    }
    $sample_student_id = ensureSampleStudent();

    createAnnouncement(
        "Welcome to Dawa'ah",
        'This is a sample announcement saved in the XAMPP MySQL database. New admin announcements will appear here and on the user dashboard.',
        $admin_id,
        'medium',
        null
    );

    addResource(array(
        'title' => 'Sample Student Resource',
        'description' => 'This sample resource confirms that resources are saving and displaying from the database.',
        'resource_type' => 'article',
        'category' => 'Student Support',
        'url' => 'uploads/resources/student-welfare-support.html',
        'uploaded_by' => $admin_id
    ));

    addGalleryItem(array(
        'title' => 'Sample Gallery Item',
        'description' => 'This is a sample gallery record. Replace it with your uploaded images from the Gallery section.',
        'image_url' => 'uploads/gallery/sample-gallery.svg',
        'media_type' => 'image',
        'uploaded_by' => $admin_id
    ));

    $conn = getDBConnection();
    $conn->query("UPDATE gallery SET image_url = 'uploads/gallery/sample-gallery.svg' WHERE title = 'Sample Gallery Item' AND image_url LIKE '%via.placeholder.com%'");
    $conn->query("UPDATE resources SET url = 'uploads/resources/student-welfare-support.html' WHERE title = 'Sample Student Resource'");

    recordDonation(
        $admin_id,
        'Sample Donor',
        'sample.donor@dawaah.local',
        25.00,
        'Sadaqah',
        'Sample donation record for dashboard testing',
        'Cash',
        'SAMPLE-DON-' . time()
    );

    if ($sample_student_id > 0) {
        $payment = recordPayment($sample_student_id, 'Membership Dues', 50.00, date('Y-m-d'), 'Cash', 'SAMPLE-RCP-' . time(), 'Sample admin-approved payment.');
        if ($payment['success']) {
            completePayment($payment['payment_id'], 'SAMPLE-RCP-' . time());
        }
    }

    createEvent(array(
        'title' => "Sample Dawa'ah Orientation",
        'description' => 'A sample upcoming event used to confirm that event registration is working.',
        'event_date' => date('Y-m-d H:i:s', strtotime('+7 days 14:00')),
        'location' => 'College Mosque Hall',
        'category' => 'orientation',
        'organizer_id' => $admin_id,
        'status' => 'upcoming',
        'max_participants' => 100
    ));

    return array('success' => true, 'admin_id' => $admin_id);
}

function ensureSampleStudent() {
    $conn = getDBConnection();
    $existing = getStudentByIdentifier('SAMPLE001');
    if ($existing && isset($existing['id'])) {
        return intval($existing['id']);
    }

    $password = password_hash('sample123', PASSWORD_BCRYPT);
    $stmt_user = $conn->prepare("INSERT INTO users (username, email, password, role, status) VALUES ('SAMPLE001', 'sample.student@dawaah.local', ?, 'student', 'active')");
    $stmt_user->bind_param("s", $password);
    if (!$stmt_user->execute()) {
        $user = $conn->query("SELECT id FROM users WHERE username = 'SAMPLE001' LIMIT 1");
        if (!$user || $user->num_rows === 0) {
            return 0;
        }
        $user_id = intval($user->fetch_assoc()['id']);
    } else {
        $user_id = $conn->insert_id;
    }

    $student = array(
        'first_name' => 'Sample',
        'last_name' => 'Student',
        'student_id' => 'SAMPLE001',
        'email' => 'sample.student@dawaah.local',
        'phone' => '0000000000',
        'gender' => 'male',
        'nationality' => 'Sample',
        'school' => 'School of Nursing & Midwifery',
        'course' => 'Bachelor of Science in Nursing',
        'year_of_study' => '1',
        'semester' => '1',
        'degree_type' => 'degree',
        'home_address' => 'Sample address',
        'emergency_contact' => 'Sample contact',
        'emergency_contact_phone' => '0000000000',
        'local_guardian' => 'Sample guardian',
        'local_guardian_phone' => '0000000000',
        'passport_photo' => ''
    );
    $result = registerStudent($user_id, $student);
    return $result['success'] ? intval($result['student_id']) : 0;
}

// ============================================
// HADITH MANAGEMENT
// ============================================

function createHadithTable() {
    $conn = getDBConnection();
    
    $create_table = "CREATE TABLE IF NOT EXISTS hadiths (
        id INT PRIMARY KEY AUTO_INCREMENT,
        arabic_text TEXT NOT NULL,
        english_translation TEXT NOT NULL,
        reference VARCHAR(255) NOT NULL,
        source VARCHAR(100),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $conn->query($create_table);
}

function addHadith($hadith_data) {
    $conn = getDBConnection();
    
    createHadithTable();
    
    $sql = "INSERT INTO hadiths 
            (arabic_text, english_translation, reference, source, category)
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssss",
        $hadith_data['arabic'],
        $hadith_data['english'],
        $hadith_data['reference'],
        $hadith_data['source'],
        $hadith_data['category']
    );
    
    if ($stmt->execute()) {
        return array('success' => true, 'hadith_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getAllHadiths() {
    $conn = getDBConnection();
    
    createHadithTable();
    
    $sql = "SELECT id, arabic_text AS arabic, english_translation AS english, reference, source, category, created_at, updated_at
            FROM hadiths
            ORDER BY id ASC";
    
    $result = $conn->query($sql);
    if ($result) {
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    return array();
}

function getDailyHadith() {
    $conn = getDBConnection();
    
    createHadithTable();
    
    $sql = "SELECT id, arabic_text AS arabic, english_translation AS english, reference, source, category, created_at, updated_at
            FROM hadiths
            ORDER BY id ASC";
    $result = $conn->query($sql);
    $hadiths = $result->fetch_all(MYSQLI_ASSOC);
    
    if (count($hadiths) === 0) {
        return null;
    }
    
    // Use day of year to select same hadith for all users on same day
    $dayOfYear = date('z'); // 0-365
    $index = $dayOfYear % count($hadiths);
    
    return $hadiths[$index];
}

function getHadithById($hadith_id) {
    $conn = getDBConnection();
    
    $sql = "SELECT id, arabic_text AS arabic, english_translation AS english, reference, source, category, created_at, updated_at
            FROM hadiths
            WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $hadith_id);
    $stmt->execute();
    
    return $stmt->get_result()->fetch_assoc();
}

function updateHadith($hadith_id, $hadith_data) {
    $conn = getDBConnection();
    
    $sql = "UPDATE hadiths
            SET arabic_text = ?, english_translation = ?, reference = ?, source = ?, category = ?
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssi",
        $hadith_data['arabic'],
        $hadith_data['english'],
        $hadith_data['reference'],
        $hadith_data['source'],
        $hadith_data['category'],
        $hadith_id
    );
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function deleteHadith($hadith_id) {
    $conn = getDBConnection();
    
    $sql = "DELETE FROM hadiths WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $hadith_id);
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

if (!function_exists('getDBConnection')) {
    function getDBConnection() {
        global $conn;
        return $conn;
    }
}

?>
