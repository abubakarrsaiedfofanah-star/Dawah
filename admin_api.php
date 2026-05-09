<?php
// Dawa'ah Admin Content Management API
// This file handles admin panel actions for content management
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'database.php';
require_once 'db_operations.php';

define('ADMIN_ACCOUNT_LIMIT', 3);
$skip_auto_audit = false;

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];

// Parse JSON body if the request can include one.
$data = array();
if ($method === 'POST' || $method === 'PUT' || $method === 'DELETE') {
    if (!empty($_POST)) {
        $data = $_POST;
    } else {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            $data = array();
        }
    }
}

// Response helper
function respond($success, $message = '', $data = null) {
    maybeLogSuccessfulAdminAction($success, $message, $data);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

function uploadAdminImage($field_name, $folder_name) {
    if (!isset($_FILES[$field_name]) || $_FILES[$field_name]['error'] === UPLOAD_ERR_NO_FILE) {
        return ['success' => true, 'path' => ''];
    }
    if ($_FILES[$field_name]['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => 'Photo upload failed'];
    }
    if ($_FILES[$field_name]['size'] > 2 * 1024 * 1024) {
        return ['success' => false, 'error' => 'Photo must be 2MB or smaller'];
    }

    $tmp_name = $_FILES[$field_name]['tmp_name'];
    $image_info = getimagesize($tmp_name);
    if ($image_info === false) {
        return ['success' => false, 'error' => 'Please upload a valid image file'];
    }

    $allowed = [
        IMAGETYPE_JPEG => 'jpg',
        IMAGETYPE_PNG => 'png',
        IMAGETYPE_WEBP => 'webp',
        IMAGETYPE_GIF => 'gif'
    ];
    if (!isset($allowed[$image_info[2]])) {
        return ['success' => false, 'error' => 'Photo must be JPG, PNG, WebP, or GIF'];
    }

    $upload_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $folder_name;
    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0755, true)) {
        return ['success' => false, 'error' => 'Could not create upload folder'];
    }

    $filename = $folder_name . '_' . date('YmdHis') . '_' . bin2hex(random_bytes(6)) . '.' . $allowed[$image_info[2]];
    $destination = $upload_dir . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($tmp_name, $destination)) {
        return ['success' => false, 'error' => 'Could not save uploaded photo'];
    }

    return ['success' => true, 'path' => 'uploads/' . $folder_name . '/' . $filename];
}

function ensureUserProfilePhotoColumn() {
    $conn = getDBConnection();
    $result = $conn->query("SHOW COLUMNS FROM users LIKE 'profile_photo'");
    if (!$result || $result->num_rows === 0) {
        $conn->query("ALTER TABLE users ADD COLUMN profile_photo VARCHAR(255) NULL AFTER status");
    }
}

function getAdminUserForSession($admin_id) {
    ensureUserProfilePhotoColumn();
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT id, username, email, role, status, profile_photo FROM users WHERE id = ? AND role = 'admin' LIMIT 1");
    $stmt->bind_param("i", $admin_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getMainAdminId() {
    $conn = getDBConnection();
    $result = $conn->query("SELECT id FROM users WHERE role = 'admin' AND username <> 'system_admin' ORDER BY id ASC LIMIT 1");
    return $result && $result->num_rows ? intval($result->fetch_assoc()['id']) : 0;
}

function isMainAdminId($admin_id) {
    $admin_id = intval($admin_id);
    if ($admin_id <= 0) {
        return false;
    }
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT username, email FROM users WHERE id = ? AND role = 'admin' LIMIT 1");
    if ($stmt) {
        $stmt->bind_param("i", $admin_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $username = strtolower($user['username']);
            $email = strtolower($user['email']);
            if (
                $username === strtolower(DAWAAH_ADMIN_USERNAME) ||
                $email === strtolower(DAWAAH_ADMIN_EMAIL)
            ) {
                return true;
            }
        }
    }
    return $admin_id === getMainAdminId();
}

function adminUserPayload($user) {
    $admin_id = intval($user['id']);
    return [
        'id' => $admin_id,
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'fullName' => isset($user['full_name']) ? $user['full_name'] : $user['username'],
        'profile_photo' => isset($user['profile_photo']) ? $user['profile_photo'] : '',
        'isMainAdmin' => isMainAdminId($admin_id)
    ];
}

function requireAdminSession() {
    if (
        empty($_SESSION['admin_user']) ||
        !in_array($_SESSION['admin_user']['role'], ['admin', 'executive'], true)
    ) {
        respond(false, 'Admin login required');
    }
}

function requireMainAdminRole() {
    requireAdminSession();
    if ($_SESSION['admin_user']['role'] !== 'admin' || !isMainAdminId($_SESSION['admin_user']['id'])) {
        respond(false, 'Only the main admin can manage admin accounts');
    }
}

function sanitizeAuditDetails($value) {
    if (!is_array($value)) {
        return $value;
    }
    $safe = [];
    foreach ($value as $key => $item) {
        if (stripos($key, 'password') !== false) {
            $safe[$key] = '[hidden]';
        } else {
            $safe[$key] = is_array($item) ? sanitizeAuditDetails($item) : $item;
        }
    }
    return $safe;
}

function logAdminActivity($admin_id, $action_name, $details = []) {
    $admin_id = intval($admin_id);
    if ($admin_id <= 0) {
        return;
    }
    $conn = getDBConnection();
    $table_name = 'admin_panel';
    $new_values = json_encode(sanitizeAuditDetails($details));
    $ip_address = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
    $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : '';
    $stmt = $conn->prepare("INSERT INTO audit_log (user_id, action, table_name, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)");
    if ($stmt) {
        $stmt->bind_param("isssss", $admin_id, $action_name, $table_name, $new_values, $ip_address, $user_agent);
        $stmt->execute();
    }
}

function maybeLogSuccessfulAdminAction($success, $message, $response_data) {
    global $action, $method, $data, $skip_auto_audit;
    if ($skip_auto_audit || !$success || empty($_SESSION['admin_user']) || !in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
        return;
    }
    if (in_array($action, ['loginAdmin', 'logoutAdmin'], true)) {
        return;
    }
    logAdminActivity($_SESSION['admin_user']['id'], $action, [
        'method' => $method,
        'message' => $message,
        'request' => $data,
        'response' => $response_data
    ]);
}

function approvalRequiredActions() {
    return [
        'createAnnouncement',
        'deleteAnnouncement',
        'createEvent',
        'deleteEvent',
        'addLeader',
        'deleteLeader',
        'addGalleryItem',
        'deleteGalleryItem',
        'addHadith',
        'deleteHadith',
        'updateWelfareStatus',
        'setPrayerTimes',
        'addResource',
        'deleteResource',
        'approvePayment',
        'approveDonation',
        'seedSampleData'
    ];
}

function queueAdminApprovalIfNeeded() {
    global $action, $method, $data, $skip_auto_audit;
    if (
        empty($_SESSION['admin_user']) ||
        isMainAdminId($_SESSION['admin_user']['id']) ||
        !in_array($action, approvalRequiredActions(), true) ||
        !in_array($method, ['POST', 'PUT', 'DELETE'], true)
    ) {
        return;
    }

    $skip_auto_audit = true;
    logAdminActivity($_SESSION['admin_user']['id'], 'pendingAdminApproval', [
        'requested_action' => $action,
        'method' => $method,
        'request' => $data
    ]);
    respond(true, 'Sent to main admin for approval', ['pending_approval' => true]);
}

function countManagedAdmins() {
    $conn = getDBConnection();
    $result = $conn->query("SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND username <> 'system_admin'");
    return $result ? intval($result->fetch_assoc()['total']) : 0;
}

function listManagedAdmins() {
    ensureUserProfilePhotoColumn();
    $conn = getDBConnection();
    $admins = [];
    $result = $conn->query("SELECT id, username, email, role, status, profile_photo, created_at, last_login FROM users WHERE role = 'admin' AND username <> 'system_admin' ORDER BY id ASC");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $admins[] = [
                'id' => intval($row['id']),
                'username' => $row['username'],
                'email' => $row['email'],
                'role' => $row['role'],
                'status' => $row['status'],
                'profile_photo' => $row['profile_photo'],
                'created_at' => $row['created_at'],
                'last_login' => $row['last_login']
            ];
        }
    }
    return $admins;
}

if ($action === 'loginAdmin' && $method === 'POST') {
    $username = isset($data['username']) ? trim($data['username']) : '';
    $password = isset($data['password']) ? $data['password'] : '';

    if ($username === '' || $password === '') {
        respond(false, 'Admin username and password required');
    }

    $result = loginUser($username, $password);
    if (!$result['success'] || empty($result['user'])) {
        respond(false, 'Invalid admin username or password');
    }

    $user = $result['user'];
    if (!in_array($user['role'], ['admin', 'executive'], true)) {
        respond(false, 'This account is not allowed to access the admin panel');
    }

    $fresh_user = getAdminUserForSession(intval($user['id']));
    $_SESSION['admin_user'] = adminUserPayload($fresh_user ?: $user);
    logAdminActivity($_SESSION['admin_user']['id'], 'loginAdmin', ['message' => 'Admin logged in']);
    respond(true, 'Admin login successful', $_SESSION['admin_user']);
}

if ($action === 'getAdminSetupStatus' && $method === 'GET') {
    $admin_total = countManagedAdmins();
    respond(true, 'Admin setup status retrieved', [
        'admin_count' => $admin_total,
        'admin_limit' => ADMIN_ACCOUNT_LIMIT,
        'can_register_first_admin' => $admin_total === 0
    ]);
}

if ($action === 'registerAdmin' && $method === 'POST') {
    $username = isset($data['username']) ? trim($data['username']) : '';
    $email = isset($data['email']) ? trim($data['email']) : '';
    $password = isset($data['password']) ? $data['password'] : '';

    if ($username === '' || $email === '' || $password === '') {
        respond(false, 'All admin registration fields are required');
    }
    if (strlen($password) < 6) {
        respond(false, 'Password must be at least 6 characters');
    }

    $conn = getDBConnection();
    $admin_total = countManagedAdmins();
    if ($admin_total > 0) {
        respond(false, 'Only the first admin can register here. Other admins must be added inside the admin panel.');
    }
    if ($admin_total >= ADMIN_ACCOUNT_LIMIT) {
        respond(false, 'Only three admin accounts are allowed');
    }

    $stmt_check = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1");
    $stmt_check->bind_param("ss", $username, $email);
    $stmt_check->execute();
    if ($stmt_check->get_result()->num_rows > 0) {
        respond(false, 'This admin username or email already exists');
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $role = 'admin';
    $status = 'active';
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $username, $email, $hashed_password, $role, $status);

    if (!$stmt->execute()) {
        respond(false, 'Could not create admin account');
    }

    $admin = [
        'id' => $conn->insert_id,
        'username' => $username,
        'email' => $email,
        'role' => $role
    ];
    $_SESSION['admin_user'] = adminUserPayload($admin);
    logAdminActivity($_SESSION['admin_user']['id'], 'registerAdmin', ['message' => 'First admin registered']);
    respond(true, 'Admin account created', $_SESSION['admin_user']);
}

if ($action === 'checkAdminSession' && $method === 'GET') {
    if (!empty($_SESSION['admin_user']) && in_array($_SESSION['admin_user']['role'], ['admin', 'executive'], true)) {
        $_SESSION['admin_user']['isMainAdmin'] = isMainAdminId($_SESSION['admin_user']['id']);
        respond(true, 'Admin session active', $_SESSION['admin_user']);
    }
    respond(false, 'Admin login required');
}

if ($action === 'logoutAdmin' && $method === 'POST') {
    if (!empty($_SESSION['admin_user'])) {
        logAdminActivity($_SESSION['admin_user']['id'], 'logoutAdmin', ['message' => 'Admin logged out']);
    }
    unset($_SESSION['admin_user']);
    session_destroy();
    respond(true, 'Admin logged out');
}

$publicActions = [
    'getAnnouncements',
    'getEvents',
    'getLeaders',
    'getGallery',
    'getPrayerTimes',
    'getResources',
    'getHadiths'
];

if (!in_array($action, $publicActions, true)) {
    requireAdminSession();
}

function executeApprovedAdminAction($requested_action, $request) {
    if ($requested_action === 'createAnnouncement') {
        return createAnnouncement(
            $request['title'] ?? '',
            $request['content'] ?? '',
            intval($request['author_id'] ?? 0),
            $request['priority'] ?? 'normal',
            $request['expires_at'] ?? null
        );
    }
    if ($requested_action === 'deleteAnnouncement') return deleteAnnouncement(intval($request['announcement_id'] ?? 0));
    if ($requested_action === 'createEvent') {
        return createEvent([
            'title' => $request['title'] ?? '',
            'description' => $request['description'] ?? '',
            'event_date' => $request['event_date'] ?? '',
            'location' => $request['location'] ?? '',
            'category' => $request['category'] ?? 'general',
            'organizer_id' => $request['organizer_id'] ?? null,
            'status' => $request['status'] ?? 'upcoming',
            'max_participants' => intval($request['max_participants'] ?? ($request['capacity'] ?? 100))
        ]);
    }
    if ($requested_action === 'deleteEvent') return deleteEvent(intval($request['event_id'] ?? 0));
    if ($requested_action === 'addLeader') {
        return addPublicLeader([
            'name' => $request['name'] ?? '',
            'position' => $request['position'] ?? '',
            'bio' => $request['bio'] ?? '',
            'course' => $request['course'] ?? '',
            'year_of_study' => $request['year_of_study'] ?? '',
            'description' => $request['description'] ?? '',
            'email' => $request['email'] ?? '',
            'phone' => $request['phone'] ?? '',
            'user_id' => intval($request['user_id'] ?? 0),
            'photo_url' => $request['photo_url'] ?? null
        ]);
    }
    if ($requested_action === 'deleteLeader') return deletePublicLeader(intval($request['leader_id'] ?? 0));
    if ($requested_action === 'addGalleryItem') {
        $image_url = $request['image_url'] ?? '';
        if (strpos($image_url, 'data:image/') === 0) {
            $saved_image = saveGalleryDataImage($image_url);
            if (!$saved_image['success']) return ['success' => false, 'error' => $saved_image['error']];
            $image_url = $saved_image['path'];
        }
        return addGalleryItem([
            'title' => $request['title'] ?? '',
            'description' => $request['description'] ?? '',
            'image_url' => $image_url,
            'uploaded_by' => intval($request['uploaded_by'] ?? 0)
        ]);
    }
    if ($requested_action === 'deleteGalleryItem') return deleteGalleryItem(intval($request['gallery_id'] ?? 0));
    if ($requested_action === 'addHadith') {
        return addHadith([
            'arabic' => $request['arabic'] ?? '',
            'english' => $request['english'] ?? '',
            'reference' => $request['reference'] ?? '',
            'source' => $request['source'] ?? '',
            'category' => $request['category'] ?? ''
        ]);
    }
    if ($requested_action === 'deleteHadith') return deleteHadith(intval($request['hadith_id'] ?? 0));
    if ($requested_action === 'updateWelfareStatus') return updateWelfareStatus(intval($request['request_id'] ?? 0), $request['status'] ?? '', $request['notes'] ?? '', intval($request['approved_by'] ?? 0));
    if ($requested_action === 'setPrayerTimes') {
        return setPrayerTimes($request['date'] ?? date('Y-m-d'), [
            'fajr' => $request['fajr'] ?? null,
            'dhuhr' => $request['dhuhr'] ?? null,
            'asr' => $request['asr'] ?? null,
            'maghrib' => $request['maghrib'] ?? null,
            'isha' => $request['isha'] ?? null,
            'iqamah_fajr' => $request['iqamah_fajr'] ?? null,
            'iqamah_dhuhr' => $request['iqamah_dhuhr'] ?? null,
            'iqamah_asr' => $request['iqamah_asr'] ?? null,
            'iqamah_maghrib' => $request['iqamah_maghrib'] ?? null,
            'iqamah_isha' => $request['iqamah_isha'] ?? null,
            'jummah_time' => $request['jummah_time'] ?? null
        ]);
    }
    if ($requested_action === 'addResource') return addResource($request);
    if ($requested_action === 'deleteResource') return deleteResource(intval($request['resource_id'] ?? 0));
    if ($requested_action === 'approvePayment') return completePayment(intval($request['payment_id'] ?? 0), 'ADMIN-PAY-' . intval($request['payment_id'] ?? 0) . '-' . time());
    if ($requested_action === 'approveDonation') return completeDonation(intval($request['donation_id'] ?? 0), 'ADMIN-DON-' . intval($request['donation_id'] ?? 0) . '-' . time());
    if ($requested_action === 'seedSampleData') return seedAdminSampleData();
    return ['success' => false, 'error' => 'Unsupported approval action'];
}

if ($action === 'listAdminAccounts' && $method === 'GET') {
    requireMainAdminRole();
    $admins = listManagedAdmins();
    $current_id = intval($_SESSION['admin_user']['id']);
    foreach ($admins as &$admin) {
        $admin['is_current'] = intval($admin['id']) === $current_id;
    }
    respond(true, 'Admin accounts retrieved', [
        'admins' => $admins,
        'admin_count' => count($admins),
        'admin_limit' => ADMIN_ACCOUNT_LIMIT
    ]);
}

if ($action === 'createAdminAccount' && $method === 'POST') {
    requireMainAdminRole();
    $username = isset($data['username']) ? trim($data['username']) : '';
    $email = isset($data['email']) ? trim($data['email']) : '';
    $password = isset($data['password']) ? $data['password'] : '';

    if ($username === '' || $email === '' || $password === '') {
        respond(false, 'All admin fields are required');
    }
    if (strlen($password) < 6) {
        respond(false, 'Password must be at least 6 characters');
    }
    if (countManagedAdmins() >= ADMIN_ACCOUNT_LIMIT) {
        respond(false, 'This admin can only add two other admins');
    }

    $conn = getDBConnection();
    $stmt_check = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1");
    $stmt_check->bind_param("ss", $username, $email);
    $stmt_check->execute();
    if ($stmt_check->get_result()->num_rows > 0) {
        respond(false, 'This admin username or email already exists');
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $role = 'admin';
    $status = 'active';
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $username, $email, $hashed_password, $role, $status);
    if (!$stmt->execute()) {
        respond(false, 'Could not create admin account');
    }

    respond(true, 'Admin account added', [
        'id' => $conn->insert_id,
        'username' => $username,
        'email' => $email,
        'role' => $role,
        'status' => $status
    ]);
}

if ($action === 'updateAdminPhoto' && $method === 'POST') {
    requireAdminSession();
    ensureUserProfilePhotoColumn();
    $admin_id = intval($_SESSION['admin_user']['id']);
    $remove_photo = isset($data['remove_photo']) && in_array((string)$data['remove_photo'], ['1', 'true', 'yes'], true);
    $photo_path = '';

    if (!$remove_photo) {
        $photo_upload = uploadAdminImage('admin_photo', 'admin_photos');
        if (!$photo_upload['success']) {
            respond(false, $photo_upload['error']);
        }
        $photo_path = $photo_upload['path'];
        if ($photo_path === '') {
            respond(false, 'Choose a photo first');
        }
    }

    $conn = getDBConnection();
    $stmt = $conn->prepare("UPDATE users SET profile_photo = ? WHERE id = ? AND role = 'admin'");
    $stmt->bind_param("si", $photo_path, $admin_id);
    if (!$stmt->execute()) {
        respond(false, 'Could not update admin photo');
    }

    $fresh_user = getAdminUserForSession($admin_id);
    $_SESSION['admin_user'] = adminUserPayload($fresh_user);
    respond(true, $remove_photo ? 'Admin photo removed' : 'Admin photo updated', $_SESSION['admin_user']);
}

if ($action === 'deleteAdminAccount' && $method === 'DELETE') {
    requireMainAdminRole();
    $admin_id = isset($data['admin_id']) ? intval($data['admin_id']) : 0;
    $current_id = intval($_SESSION['admin_user']['id']);
    if ($admin_id <= 0) {
        respond(false, 'Admin ID required');
    }
    if ($admin_id === $current_id) {
        respond(false, 'You cannot remove your own admin account while logged in');
    }
    if (countManagedAdmins() <= 1) {
        respond(false, 'At least one admin account must remain');
    }

    $conn = getDBConnection();
    $stmt = $conn->prepare("UPDATE users SET role = 'student', status = 'inactive' WHERE id = ? AND role = 'admin'");
    $stmt->bind_param("i", $admin_id);
    $stmt->execute();
    if ($stmt->affected_rows < 1) {
        respond(false, 'Admin account not found');
    }
    respond(true, 'Admin account removed');
}

if ($action === 'changeAdminPassword' && $method === 'POST') {
    requireAdminSession();
    $current_password = isset($data['current_password']) ? $data['current_password'] : '';
    $new_password = isset($data['new_password']) ? $data['new_password'] : '';
    if ($current_password === '' || $new_password === '') {
        respond(false, 'Current and new password are required');
    }
    if (strlen($new_password) < 6) {
        respond(false, 'New password must be at least 6 characters');
    }

    $conn = getDBConnection();
    $admin_id = intval($_SESSION['admin_user']['id']);
    $stmt = $conn->prepare("SELECT password FROM users WHERE id = ? AND role = 'admin' LIMIT 1");
    $stmt->bind_param("i", $admin_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows < 1 || !password_verify($current_password, $result->fetch_assoc()['password'])) {
        respond(false, 'Current password is incorrect');
    }

    $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
    $stmt_update = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt_update->bind_param("si", $hashed_password, $admin_id);
    if (!$stmt_update->execute()) {
        respond(false, 'Could not change password');
    }
    respond(true, 'Password changed successfully');
}

if ($action === 'resetAdminPassword' && $method === 'POST') {
    requireAdminSession();
    $admin_id = isset($data['admin_id']) ? intval($data['admin_id']) : 0;
    $new_password = isset($data['new_password']) ? $data['new_password'] : '';
    if ($admin_id <= 0 || $new_password === '') {
        respond(false, 'Admin and new password are required');
    }
    if (strlen($new_password) < 6) {
        respond(false, 'New password must be at least 6 characters');
    }
    $current_id = intval($_SESSION['admin_user']['id']);
    if ($admin_id !== $current_id && !isMainAdminId($current_id)) {
        respond(false, 'Only the main admin can reset another admin password');
    }

    $conn = getDBConnection();
    $stmt_check = $conn->prepare("SELECT id FROM users WHERE id = ? AND role = 'admin' LIMIT 1");
    $stmt_check->bind_param("i", $admin_id);
    $stmt_check->execute();
    if ($stmt_check->get_result()->num_rows < 1) {
        respond(false, 'Admin account not found');
    }

    $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
    $stmt_update = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt_update->bind_param("si", $hashed_password, $admin_id);
    if (!$stmt_update->execute()) {
        respond(false, 'Could not reset password');
    }
    respond(true, 'Admin password reset successfully');
}

if ($action === 'getAdminActivityLogs' && $method === 'GET') {
    requireMainAdminRole();
    $conn = getDBConnection();
    $logs = [];
    $result = $conn->query(
        "SELECT a.id, a.user_id, u.username, u.email, a.action, a.new_values, a.ip_address, a.created_at
         FROM audit_log a
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.table_name = 'admin_panel' AND (u.username IS NULL OR u.username <> 'system_admin')
         ORDER BY a.created_at DESC
         LIMIT 100"
    );
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $details = json_decode($row['new_values'], true);
            $logs[] = [
                'id' => intval($row['id']),
                'admin_id' => intval($row['user_id']),
                'username' => $row['username'],
                'email' => $row['email'],
                'action' => $row['action'],
                'details' => is_array($details) ? $details : [],
                'ip_address' => $row['ip_address'],
                'created_at' => $row['created_at']
            ];
        }
    }
    respond(true, 'Admin activity logs retrieved', $logs);
}

if ($action === 'getMyAdminActivityLogs' && $method === 'GET') {
    requireAdminSession();
    $conn = getDBConnection();
    $admin_id = intval($_SESSION['admin_user']['id']);
    $logs = [];
    $stmt = $conn->prepare(
        "SELECT a.id, a.user_id, u.username, u.email, a.action, a.new_values, a.ip_address, a.created_at
         FROM audit_log a
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.table_name = 'admin_panel' AND a.user_id = ?
         ORDER BY a.created_at DESC
         LIMIT 50"
    );
    $stmt->bind_param("i", $admin_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $details = json_decode($row['new_values'], true);
            $logs[] = [
                'id' => intval($row['id']),
                'admin_id' => intval($row['user_id']),
                'username' => $row['username'],
                'email' => $row['email'],
                'action' => $row['action'],
                'details' => is_array($details) ? $details : [],
                'ip_address' => $row['ip_address'],
                'created_at' => $row['created_at']
            ];
        }
    }
    respond(true, 'My admin activity logs retrieved', $logs);
}

function getAdminActivityLog($log_id) {
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT a.*, u.username FROM audit_log a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ? AND a.table_name = 'admin_panel' LIMIT 1");
    $stmt->bind_param("i", $log_id);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->num_rows ? $result->fetch_assoc() : null;
}

function getAuditValue($details, $key) {
    if (isset($details['response'][$key])) return intval($details['response'][$key]);
    if (isset($details['request'][$key])) return intval($details['request'][$key]);
    if (isset($details[$key])) return intval($details[$key]);
    return 0;
}

if ($action === 'opposeAdminActivity' && $method === 'POST') {
    requireMainAdminRole();
    $log_id = isset($data['log_id']) ? intval($data['log_id']) : 0;
    $reason = isset($data['reason']) ? trim($data['reason']) : '';
    if ($log_id <= 0) {
        respond(false, 'Activity log ID required');
    }
    $log = getAdminActivityLog($log_id);
    if (!$log) {
        respond(false, 'Activity log not found');
    }
    logAdminActivity($_SESSION['admin_user']['id'], 'opposeAdminActivity', [
        'log_id' => $log_id,
        'opposed_admin' => $log['username'],
        'opposed_action' => $log['action'],
        'reason' => $reason
    ]);
    respond(true, 'Activity opposed and recorded');
}

if ($action === 'deleteAdminActivityItem' && $method === 'POST') {
    requireMainAdminRole();
    $log_id = isset($data['log_id']) ? intval($data['log_id']) : 0;
    if ($log_id <= 0) {
        respond(false, 'Activity log ID required');
    }
    $log = getAdminActivityLog($log_id);
    if (!$log) {
        respond(false, 'Activity log not found');
    }
    $details = json_decode($log['new_values'], true);
    if (!is_array($details)) {
        $details = [];
    }

    $delete_result = ['success' => false, 'error' => 'This activity cannot be deleted automatically'];
    if ($log['action'] === 'createAnnouncement') {
        $delete_result = deleteAnnouncement(getAuditValue($details, 'announcement_id'));
    } elseif ($log['action'] === 'createEvent') {
        $delete_result = deleteEvent(getAuditValue($details, 'event_id'));
    } elseif ($log['action'] === 'addLeader') {
        $delete_result = deletePublicLeader(getAuditValue($details, 'leader_id'));
    } elseif ($log['action'] === 'addGalleryItem') {
        $delete_result = deleteGalleryItem(getAuditValue($details, 'gallery_id'));
    } elseif ($log['action'] === 'addHadith') {
        $delete_result = deleteHadith(getAuditValue($details, 'hadith_id'));
    } elseif ($log['action'] === 'addResource') {
        $delete_result = deleteResource(getAuditValue($details, 'resource_id'));
    }

    if (empty($delete_result['success'])) {
        respond(false, isset($delete_result['error']) ? $delete_result['error'] : 'Could not delete item');
    }

    logAdminActivity($_SESSION['admin_user']['id'], 'deleteAdminActivityItem', [
        'log_id' => $log_id,
        'opposed_admin' => $log['username'],
        'opposed_action' => $log['action'],
        'reason' => isset($data['reason']) ? trim($data['reason']) : ''
    ]);
    respond(true, 'Item deleted and action recorded');
}

if ($action === 'approvePendingAdminActivity' && $method === 'POST') {
    requireMainAdminRole();
    $log_id = isset($data['log_id']) ? intval($data['log_id']) : 0;
    $log = getAdminActivityLog($log_id);
    if (!$log || $log['action'] !== 'pendingAdminApproval') {
        respond(false, 'Pending approval item not found');
    }
    $details = json_decode($log['new_values'], true);
    $requested_action = $details['requested_action'] ?? '';
    $request = isset($details['request']) && is_array($details['request']) ? $details['request'] : [];
    $result = executeApprovedAdminAction($requested_action, $request);
    if (empty($result['success'])) {
        respond(false, $result['error'] ?? 'Could not approve action');
    }
    logAdminActivity($_SESSION['admin_user']['id'], 'approvePendingAdminActivity', [
        'log_id' => $log_id,
        'approved_admin' => $log['username'],
        'approved_action' => $requested_action,
        'result' => $result
    ]);
    respond(true, 'Pending action approved and applied', $result);
}

if ($action === 'rejectPendingAdminActivity' && $method === 'POST') {
    requireMainAdminRole();
    $log_id = isset($data['log_id']) ? intval($data['log_id']) : 0;
    $reason = isset($data['reason']) ? trim($data['reason']) : '';
    $log = getAdminActivityLog($log_id);
    if (!$log || $log['action'] !== 'pendingAdminApproval') {
        respond(false, 'Pending approval item not found');
    }
    $details = json_decode($log['new_values'], true);
    logAdminActivity($_SESSION['admin_user']['id'], 'rejectPendingAdminActivity', [
        'log_id' => $log_id,
        'rejected_admin' => $log['username'],
        'rejected_action' => $details['requested_action'] ?? '',
        'reason' => $reason
    ]);
    respond(true, 'Pending action rejected and recorded');
}

if ($action === 'undoMyAdminActivityItem' && $method === 'POST') {
    requireAdminSession();
    $log_id = isset($data['log_id']) ? intval($data['log_id']) : 0;
    if ($log_id <= 0) {
        respond(false, 'Activity log ID required');
    }
    $log = getAdminActivityLog($log_id);
    if (!$log) {
        respond(false, 'Activity log not found');
    }
    if (intval($log['user_id']) !== intval($_SESSION['admin_user']['id'])) {
        respond(false, 'You can only undo your own admin actions');
    }
    $details = json_decode($log['new_values'], true);
    if (!is_array($details)) {
        $details = [];
    }

    $undo_result = ['success' => false, 'error' => 'This activity cannot be undone automatically'];
    if ($log['action'] === 'createAnnouncement') {
        $undo_result = deleteAnnouncement(getAuditValue($details, 'announcement_id'));
    } elseif ($log['action'] === 'createEvent') {
        $undo_result = deleteEvent(getAuditValue($details, 'event_id'));
    } elseif ($log['action'] === 'addLeader') {
        $undo_result = deletePublicLeader(getAuditValue($details, 'leader_id'));
    } elseif ($log['action'] === 'addGalleryItem') {
        $undo_result = deleteGalleryItem(getAuditValue($details, 'gallery_id'));
    } elseif ($log['action'] === 'addHadith') {
        $undo_result = deleteHadith(getAuditValue($details, 'hadith_id'));
    } elseif ($log['action'] === 'addResource') {
        $undo_result = deleteResource(getAuditValue($details, 'resource_id'));
    } elseif ($log['action'] === 'setPrayerTimes') {
        $request = isset($details['request']) && is_array($details['request']) ? $details['request'] : [];
        $previous = isset($request['_previous_prayer_times']) && is_array($request['_previous_prayer_times']) ? $request['_previous_prayer_times'] : null;
        if ($previous && !empty($previous['date'])) {
            $undo_result = setPrayerTimes($previous['date'], [
                'fajr' => $previous['fajr'] ?? null,
                'dhuhr' => $previous['dhuhr'] ?? null,
                'asr' => $previous['asr'] ?? null,
                'maghrib' => $previous['maghrib'] ?? null,
                'isha' => $previous['isha'] ?? null,
                'iqamah_fajr' => $previous['iqamah_fajr'] ?? null,
                'iqamah_dhuhr' => $previous['iqamah_dhuhr'] ?? null,
                'iqamah_asr' => $previous['iqamah_asr'] ?? null,
                'iqamah_maghrib' => $previous['iqamah_maghrib'] ?? null,
                'iqamah_isha' => $previous['iqamah_isha'] ?? null,
                'jummah_time' => $previous['jummah_time'] ?? null
            ]);
        } else {
            $undo_result = ['success' => false, 'error' => 'No previous prayer timetable was saved for this action'];
        }
    }

    if (empty($undo_result['success'])) {
        respond(false, isset($undo_result['error']) ? $undo_result['error'] : 'Could not undo item');
    }

    logAdminActivity($_SESSION['admin_user']['id'], 'undoMyAdminActivityItem', [
        'log_id' => $log_id,
        'undone_action' => $log['action'],
        'reason' => isset($data['reason']) ? trim($data['reason']) : ''
    ]);
    respond(true, 'Your action was undone and recorded');
}

queueAdminApprovalIfNeeded();

// ============================================
// ANNOUNCEMENTS MANAGEMENT
// ============================================

if ($action === 'getDashboardStats' && $method === 'GET') {
    respond(true, 'Dashboard stats retrieved', getAdminDashboardStats());
}

if ($action === 'getDashboardDetail' && $method === 'GET') {
    $type = isset($_GET['type']) ? $_GET['type'] : '';
    $result = getAdminDashboardDetail($type);
    respond($result['success'], $result['success'] ? 'Dashboard detail retrieved' : $result['error'], $result);
}

if ($action === 'approvePayment' && $method === 'POST') {
    $payment_id = isset($data['payment_id']) ? intval($data['payment_id']) : 0;
    if ($payment_id === 0) {
        respond(false, 'Payment ID required');
    }
    $transaction_id = 'ADMIN-PAY-' . $payment_id . '-' . time();
    $result = completePayment($payment_id, $transaction_id);
    respond($result['success'], $result['success'] ? 'Payment approved' : $result['error'], $result);
}

if ($action === 'approveDonation' && $method === 'POST') {
    $donation_id = isset($data['donation_id']) ? intval($data['donation_id']) : 0;
    if ($donation_id === 0) {
        respond(false, 'Donation ID required');
    }
    $transaction_id = 'ADMIN-DON-' . $donation_id . '-' . time();
    $result = completeDonation($donation_id, $transaction_id);
    respond($result['success'], $result['success'] ? 'Donation approved' : $result['error'], $result);
}

if ($action === 'seedSampleData' && $method === 'POST') {
    $result = seedAdminSampleData();
    respond($result['success'], $result['success'] ? 'Sample database records added' : 'Error adding sample records', $result);
}

if ($action === 'createAnnouncement' && $method === 'POST') {
    $title = isset($data['title']) ? $data['title'] : '';
    $content = isset($data['content']) ? $data['content'] : '';
    $author_id = isset($data['author_id']) ? intval($data['author_id']) : 0;
    $priority = isset($data['priority']) ? $data['priority'] : 'normal';
    $expires_at = isset($data['expires_at']) ? $data['expires_at'] : null;
    
    if (empty($title) || empty($content)) {
        respond(false, 'Title and content are required');
    }
    
    $result = createAnnouncement($title, $content, $author_id, $priority, $expires_at);
    respond($result['success'], $result['success'] ? 'Announcement created' : 'Error creating announcement', $result);
}

if ($action === 'getAnnouncements' && $method === 'GET') {
    $announcements = getActiveAnnouncements();
    respond(true, 'Announcements retrieved', $announcements);
}

if ($action === 'deleteAnnouncement' && $method === 'DELETE') {
    $announcement_id = isset($data['announcement_id']) ? intval($data['announcement_id']) : 0;
    
    if ($announcement_id === 0) {
        respond(false, 'Announcement ID required');
    }
    
    $result = deleteAnnouncement($announcement_id);
    respond($result['success'], $result['success'] ? 'Announcement deleted' : 'Error deleting announcement', $result);
}

// ============================================
// EVENTS MANAGEMENT
// ============================================

if ($action === 'createEvent' && $method === 'POST') {
    $title = isset($data['title']) ? $data['title'] : '';
    $description = isset($data['description']) ? $data['description'] : '';
    $event_date = isset($data['event_date']) ? $data['event_date'] : '';
    $location = isset($data['location']) ? $data['location'] : '';
    $organizer_id = isset($data['organizer_id']) ? $data['organizer_id'] : '';
    $capacity = isset($data['max_participants']) ? intval($data['max_participants']) : (isset($data['capacity']) ? intval($data['capacity']) : 100);
    
    if (empty($title) || empty($description) || empty($event_date)) {
        respond(false, 'Title, description, and date are required');
    }
    
    $event_data = [
        'title' => $title,
        'description' => $description,
        'event_date' => $event_date,
        'location' => $location,
        'category' => isset($data['category']) ? $data['category'] : 'general',
        'organizer_id' => $organizer_id,
        'status' => isset($data['status']) ? $data['status'] : 'upcoming',
        'max_participants' => $capacity
    ];
    
    $result = createEvent($event_data);
    respond($result['success'], $result['success'] ? 'Event created' : 'Error creating event', $result);
}

if ($action === 'getEvents' && $method === 'GET') {
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $events = getUpcomingEvents($limit);
    respond(true, 'Events retrieved', $events);
}

if ($action === 'getEventRegistrations' && $method === 'GET') {
    $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;
    respond(true, 'Event registrations retrieved', getEventRegistrations($event_id));
}

if ($action === 'deleteEvent' && $method === 'DELETE') {
    $event_id = isset($data['event_id']) ? intval($data['event_id']) : 0;
    
    if ($event_id === 0) {
        respond(false, 'Event ID required');
    }
    
    $result = deleteEvent($event_id);
    respond($result['success'], $result['success'] ? 'Event deleted' : 'Error deleting event', $result);
}

// ============================================
// LEADERSHIP MANAGEMENT
// ============================================

if ($action === 'addLeader' && $method === 'POST') {
    $photo_upload = uploadAdminImage('leader_passport_photo', 'leader_photos');
    if (!$photo_upload['success']) {
        respond(false, $photo_upload['error']);
    }
    $name = isset($data['name']) ? $data['name'] : '';
    $position = isset($data['position']) ? $data['position'] : '';
    $bio = isset($data['bio']) ? $data['bio'] : '';
    $course = isset($data['course']) ? $data['course'] : '';
    $year_of_study = isset($data['year_of_study']) ? $data['year_of_study'] : '';
    $description = isset($data['description']) ? $data['description'] : '';
    $email = isset($data['email']) ? $data['email'] : '';
    $phone = isset($data['phone']) ? $data['phone'] : '';
    $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
    
    if (empty($name) || empty($position)) {
        respond(false, 'Name and position are required');
    }
    
    $leader_data = [
        'name' => $name,
        'position' => $position,
        'bio' => $bio,
        'course' => $course,
        'year_of_study' => $year_of_study,
        'description' => $description,
        'email' => $email,
        'phone' => $phone,
        'user_id' => $user_id,
        'photo_url' => $photo_upload['path'] !== '' ? $photo_upload['path'] : (isset($data['photo_url']) ? $data['photo_url'] : null)
    ];
    
    $result = addPublicLeader($leader_data);
    respond($result['success'], $result['success'] ? 'Leader added' : 'Error adding leader', $result);
}

if ($action === 'getLeaders' && $method === 'GET') {
    $leaders = getPublicLeaders();
    respond(true, 'Leaders retrieved', $leaders);
}

if ($action === 'deleteLeader' && $method === 'DELETE') {
    $leader_id = isset($data['leader_id']) ? intval($data['leader_id']) : 0;
    
    if ($leader_id === 0) {
        respond(false, 'Leader ID required');
    }
    
    $result = deletePublicLeader($leader_id);
    respond($result['success'], $result['success'] ? 'Leader deleted' : 'Error deleting leader', $result);
}

// ============================================
// GALLERY MANAGEMENT
// ============================================

// ============================================
// GALLERY MANAGEMENT
// ============================================

if ($action === 'addGalleryItem' && $method === 'POST') {
    $title = isset($data['title']) ? $data['title'] : '';
    $description = isset($data['description']) ? $data['description'] : '';
    $image_url = isset($data['image_url']) ? $data['image_url'] : '';
    $uploaded_by = isset($data['uploaded_by']) ? intval($data['uploaded_by']) : 0;
    
    if (empty($title) || empty($image_url)) {
        respond(false, 'Title and image URL are required');
    }

    if (strpos($image_url, 'data:image/') === 0) {
        $saved_image = saveGalleryDataImage($image_url);
        if (!$saved_image['success']) {
            respond(false, $saved_image['error']);
        }
        $image_url = $saved_image['path'];
    }
    
    $gallery_data = [
        'title' => $title,
        'description' => $description,
        'image_url' => $image_url,
        'uploaded_by' => $uploaded_by
    ];
    
    $result = addGalleryItem($gallery_data);
    respond($result['success'], $result['success'] ? 'Gallery item added' : 'Error adding gallery item', $result);
}

function saveGalleryDataImage($data_url) {
    if (!preg_match('/^data:image\/(png|jpe?g|gif|webp);base64,/', $data_url, $matches)) {
        return ['success' => false, 'error' => 'Unsupported image format'];
    }

    $extension = strtolower($matches[1]);
    if ($extension === 'jpeg') {
        $extension = 'jpg';
    }

    $base64 = substr($data_url, strpos($data_url, ',') + 1);
    $image_data = base64_decode($base64, true);
    if ($image_data === false) {
        return ['success' => false, 'error' => 'Invalid image data'];
    }

    if (strlen($image_data) > 5 * 1024 * 1024) {
        return ['success' => false, 'error' => 'Image is too large. Please use an image under 5MB.'];
    }

    $upload_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'gallery';
    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0755, true)) {
        return ['success' => false, 'error' => 'Could not create gallery upload folder'];
    }

    $filename = 'gallery_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $full_path = $upload_dir . DIRECTORY_SEPARATOR . $filename;

    if (file_put_contents($full_path, $image_data) === false) {
        return ['success' => false, 'error' => 'Could not save image file'];
    }

    return ['success' => true, 'path' => 'uploads/gallery/' . $filename];
}

if ($action === 'getGallery' && $method === 'GET') {
    $gallery = getGalleryItems();
    respond(true, 'Gallery items retrieved', $gallery);
}

if ($action === 'deleteGalleryItem' && $method === 'DELETE') {
    $gallery_id = isset($data['gallery_id']) ? intval($data['gallery_id']) : 0;
    
    if ($gallery_id === 0) {
        respond(false, 'Gallery ID required');
    }
    
    $result = deleteGalleryItem($gallery_id);
    respond($result['success'], $result['success'] ? 'Gallery item deleted' : 'Error deleting gallery item', $result);
}

// ============================================
// WELFARE, PRAYER TIMES, RESOURCES
// ============================================

if ($action === 'getWelfareRequests' && $method === 'GET') {
    respond(true, 'Welfare requests retrieved', getAllWelfareRequests());
}

if ($action === 'updateWelfareStatus' && $method === 'POST') {
    $request_id = isset($data['request_id']) ? intval($data['request_id']) : 0;
    $status = isset($data['status']) ? $data['status'] : '';
    $notes = isset($data['notes']) ? $data['notes'] : '';
    if ($request_id === 0 || empty($status)) {
        respond(false, 'Request ID and status are required');
    }
    $result = updateWelfareStatus($request_id, $status, $notes, isset($data['approved_by']) ? intval($data['approved_by']) : 0);
    respond($result['success'], $result['success'] ? 'Welfare request updated' : 'Error updating welfare request', $result);
}

if ($action === 'getPrayerTimes' && $method === 'GET') {
    $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
    respond(true, 'Prayer times retrieved', getPrayerTimes($date));
}

if ($action === 'setPrayerTimes' && $method === 'POST') {
    $date = isset($data['date']) ? $data['date'] : date('Y-m-d');
    $data['_previous_prayer_times'] = getPrayerTimes($date);
    $times = [
        'fajr' => $data['fajr'] ?? null,
        'dhuhr' => $data['dhuhr'] ?? null,
        'asr' => $data['asr'] ?? null,
        'maghrib' => $data['maghrib'] ?? null,
        'isha' => $data['isha'] ?? null,
        'iqamah_fajr' => $data['iqamah_fajr'] ?? null,
        'iqamah_dhuhr' => $data['iqamah_dhuhr'] ?? null,
        'iqamah_asr' => $data['iqamah_asr'] ?? null,
        'iqamah_maghrib' => $data['iqamah_maghrib'] ?? null,
        'iqamah_isha' => $data['iqamah_isha'] ?? null,
        'jummah_time' => $data['jummah_time'] ?? null
    ];
    $result = setPrayerTimes($date, $times);
    respond($result['success'], $result['success'] ? 'Prayer times saved' : 'Error saving prayer times', $result);
}

if ($action === 'getResources' && $method === 'GET') {
    respond(true, 'Resources retrieved', getResources());
}

if ($action === 'addResource' && $method === 'POST') {
    $title = isset($data['title']) ? $data['title'] : '';
    $type = isset($data['resource_type']) ? $data['resource_type'] : (isset($data['type']) ? $data['type'] : '');
    if (empty($title) || empty($type)) {
        respond(false, 'Title and resource type are required');
    }
    if (isset($_FILES['resource_file']) && $_FILES['resource_file']['error'] !== UPLOAD_ERR_NO_FILE) {
        $saved_file = saveResourceUpload($_FILES['resource_file']);
        if (!$saved_file['success']) {
            respond(false, $saved_file['error']);
        }
        $data['file_path'] = $saved_file['path'];
        if (empty($data['url'])) {
            $data['url'] = $saved_file['path'];
        }
    }
    $result = addResource($data);
    respond($result['success'], $result['success'] ? 'Resource added' : 'Error adding resource', $result);
}

function saveResourceUpload($file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => 'Resource upload failed'];
    }

    $allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mp3', 'wav'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowed, true)) {
        return ['success' => false, 'error' => 'This resource file type is not allowed'];
    }

    $upload_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'resources';
    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0777, true)) {
        return ['success' => false, 'error' => 'Could not create resource upload folder'];
    }

    $safe_base = preg_replace('/[^a-zA-Z0-9_-]+/', '-', pathinfo($file['name'], PATHINFO_FILENAME));
    $filename = 'resource_' . date('Ymd_His') . '_' . ($safe_base ?: 'file') . '.' . $extension;
    $target = $upload_dir . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($file['tmp_name'], $target)) {
        return ['success' => false, 'error' => 'Could not save uploaded resource'];
    }

    return ['success' => true, 'path' => 'uploads/resources/' . $filename];
}

if ($action === 'deleteResource' && $method === 'DELETE') {
    $resource_id = isset($data['resource_id']) ? intval($data['resource_id']) : 0;
    if ($resource_id === 0) {
        respond(false, 'Resource ID required');
    }
    $result = deleteResource($resource_id);
    respond($result['success'], $result['success'] ? 'Resource deleted' : 'Error deleting resource', $result);
}

// ============================================
// HADITH MANAGEMENT
// ============================================

if ($action === 'addHadith' && $method === 'POST') {
    $arabic = isset($data['arabic']) ? $data['arabic'] : '';
    $english = isset($data['english']) ? $data['english'] : '';
    $reference = isset($data['reference']) ? $data['reference'] : '';
    $source = isset($data['source']) ? $data['source'] : '';
    $category = isset($data['category']) ? $data['category'] : '';
    $added_by = isset($data['added_by']) ? intval($data['added_by']) : 1;
    
    if (empty($arabic) || empty($english)) {
        respond(false, 'Arabic and English texts are required');
    }
    
    $hadith_data = [
        'arabic' => $arabic,
        'english' => $english,
        'reference' => $reference,
        'source' => $source,
        'category' => $category,
        'added_by' => $added_by
    ];
    
    $result = addHadith($hadith_data);
    respond($result['success'], $result['success'] ? 'Hadith added successfully' : 'Error adding hadith', $result);
}

if ($action === 'getHadiths' && $method === 'GET') {
    $hadiths = getAllHadiths();
    respond(true, 'Hadiths retrieved', $hadiths);
}

if ($action === 'getDailyHadith' && $method === 'GET') {
    $hadith = getDailyHadith();
    if ($hadith) {
        respond(true, 'Daily hadith retrieved', $hadith);
    } else {
        respond(false, 'No hadith available');
    }
}

if ($action === 'getHadithById' && $method === 'GET') {
    $hadith_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($hadith_id === 0) {
        respond(false, 'Hadith ID required');
    }
    
    $hadith = getHadithById($hadith_id);
    if ($hadith) {
        respond(true, 'Hadith retrieved', $hadith);
    } else {
        respond(false, 'Hadith not found');
    }
}

if ($action === 'updateHadith' && $method === 'PUT') {
    $hadith_id = isset($data['hadith_id']) ? intval($data['hadith_id']) : 0;
    $arabic = isset($data['arabic']) ? $data['arabic'] : '';
    $english = isset($data['english']) ? $data['english'] : '';
    $reference = isset($data['reference']) ? $data['reference'] : '';
    $source = isset($data['source']) ? $data['source'] : '';
    $category = isset($data['category']) ? $data['category'] : '';
    
    if ($hadith_id === 0 || empty($arabic) || empty($english)) {
        respond(false, 'Hadith ID and required fields are required');
    }
    
    $hadith_data = [
        'arabic' => $arabic,
        'english' => $english,
        'reference' => $reference,
        'source' => $source,
        'category' => $category
    ];
    
    $result = updateHadith($hadith_id, $hadith_data);
    respond($result['success'], $result['success'] ? 'Hadith updated successfully' : 'Error updating hadith', $result);
}

if ($action === 'deleteHadith' && $method === 'DELETE') {
    $hadith_id = isset($data['hadith_id']) ? intval($data['hadith_id']) : 0;
    
    if ($hadith_id === 0) {
        respond(false, 'Hadith ID required');
    }
    
    $result = deleteHadith($hadith_id);
    respond($result['success'], $result['success'] ? 'Hadith deleted' : 'Error deleting hadith', $result);
}

// ============================================
// DEFAULT RESPONSE
// ============================================

respond(false, 'Invalid action or method');
?>
