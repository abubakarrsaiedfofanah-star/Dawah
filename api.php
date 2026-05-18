<?php
// Dawa'ah Database API Endpoints
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require_once 'database.php';
require_once 'db_operations.php';

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];

// Parse JSON body if POST/PUT/DELETE
$data = array();
if ($method === 'POST' || $method === 'PUT' || $method === 'DELETE') {
    $content_type = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
    if (stripos($content_type, 'multipart/form-data') !== false) {
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
    maybeLogDashboardAction($success, $message, $data);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

function sanitizeDashboardAuditDetails($value) {
    if (!is_array($value)) {
        return $value;
    }
    $safe = [];
    foreach ($value as $key => $item) {
        if (stripos($key, 'password') !== false || stripos($key, 'secret') !== false) {
            $safe[$key] = '[hidden]';
        } elseif ($key === 'passportPhotoData' || $key === 'image_url' && is_string($item) && strpos($item, 'data:') === 0) {
            $safe[$key] = '[uploaded media]';
        } else {
            $safe[$key] = is_array($item) ? sanitizeDashboardAuditDetails($item) : $item;
        }
    }
    return $safe;
}

function maybeLogDashboardAction($success, $message, $response_data) {
    global $action, $method, $data;
    if (!$success || empty($_SESSION['user']) || !in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
        return;
    }
    if (in_array($action, ['loginUser', 'logoutUser'], true)) {
        return;
    }

    $user = $_SESSION['user'];
    $details = [
        'method' => $method,
        'message' => $message,
        'role' => $user['role'] ?? '',
        'username' => $user['username'] ?? '',
        'request' => sanitizeDashboardAuditDetails($data),
        'response' => sanitizeDashboardAuditDetails(is_array($response_data) ? $response_data : [])
    ];

    $conn = getDBConnection();
    $user_id = intval($user['id'] ?? 0);
    $table_name = 'member_dashboard';
    $new_values = json_encode($details);
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? '';
    $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : '';
    $stmt = $conn->prepare("INSERT INTO audit_log (user_id, action, table_name, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)");
    if ($stmt) {
        $stmt->bind_param("isssss", $user_id, $action, $table_name, $new_values, $ip_address, $user_agent);
        $stmt->execute();
    }
}

function rolePermissions() {
    $member = array(
        'view_profile',
        'view_membership',
        'register_events',
        'view_prayer_times',
        'view_announcements',
        'view_resources',
        'welfare_request',
        'view_payments',
        'view_donations',
        'register_volunteer'
    );
    $admin_managers = array_merge($member, array(
        'manage_members',
        'manage_events',
        'manage_activities',
        'manage_welfare',
        'manage_leadership',
        'manage_gallery',
        'manage_contact',
        'manage_payments',
        'manage_prayer_times',
        'manage_lectures',
        'manage_hadiths',
        'view_reports',
        'generate_reports',
        'create_announcements'
    ));

    return array(
        'student' => $member,
        'executive' => $admin_managers,
        'chairman' => array_merge($member, array('manage_welfare', 'view_reports')),
        'chairlady' => array_merge($member, array('manage_welfare', 'view_reports')),
        'secretary' => array_merge($member, array('manage_members', 'view_reports', 'generate_reports', 'create_announcements')),
        'admin' => $admin_managers,
        'treasurer' => array_merge($member, array('manage_payments', 'view_reports', 'generate_reports')),
        'media' => array_merge($member, array('manage_gallery', 'manage_contact')),
        'organizer' => array_merge($member, array('manage_events', 'manage_activities', 'register_volunteer')),
        'imam' => array('view_profile', 'view_prayer_times', 'view_announcements', 'view_resources', 'manage_prayer_times', 'manage_lectures', 'manage_hadiths')
    );
}

function actorRole($data) {
    if (!empty($_SESSION['user']) && isset($_SESSION['user']['role'])) {
        return $_SESSION['user']['role'];
    }
    return '';
}

function requirePermission($permission, $data) {
    $role = actorRole($data);
    $permissions = rolePermissions();
    if (!$role || !isset($permissions[$role]) || !in_array($permission, $permissions[$role], true)) {
        respond(false, 'Access denied for this role');
    }
}

function uploadProfilePhoto($field_name = 'passport_photo_file') {
    if (!isset($_FILES[$field_name]) || $_FILES[$field_name]['error'] === UPLOAD_ERR_NO_FILE) {
        return array('success' => true, 'path' => '');
    }

    if ($_FILES[$field_name]['error'] !== UPLOAD_ERR_OK) {
        return array('success' => false, 'error' => 'Photo upload failed');
    }

    $max_size = 2 * 1024 * 1024;
    if ($_FILES[$field_name]['size'] > $max_size) {
        return array('success' => false, 'error' => 'Photo must be 2MB or smaller');
    }

    $tmp_name = $_FILES[$field_name]['tmp_name'];
    $image_info = getimagesize($tmp_name);
    if ($image_info === false) {
        return array('success' => false, 'error' => 'Please upload a valid image file');
    }

    $allowed = array(
        IMAGETYPE_JPEG => 'jpg',
        IMAGETYPE_PNG => 'png',
        IMAGETYPE_WEBP => 'webp',
        IMAGETYPE_GIF => 'gif'
    );
    if (!isset($allowed[$image_info[2]])) {
        return array('success' => false, 'error' => 'Photo must be JPG, PNG, WebP, or GIF');
    }

    $upload_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'profile_photos';
    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0755, true)) {
        return array('success' => false, 'error' => 'Could not create photo upload folder');
    }

    $filename = 'profile_' . date('YmdHis') . '_' . bin2hex(random_bytes(6)) . '.' . $allowed[$image_info[2]];
    $destination = $upload_dir . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($tmp_name, $destination)) {
        return array('success' => false, 'error' => 'Could not save uploaded photo');
    }

    return array('success' => true, 'path' => 'uploads/profile_photos/' . $filename);
}

function parseUploadSizeToBytes($value) {
    $value = trim((string)$value);
    if ($value === '') return 0;
    $unit = strtolower(substr($value, -1));
    $number = floatval($value);
    if ($unit === 'g') return intval($number * 1024 * 1024 * 1024);
    if ($unit === 'm') return intval($number * 1024 * 1024);
    if ($unit === 'k') return intval($number * 1024);
    return intval($number);
}

function isMpesaConfiguredForHosting() {
    $config_file = __DIR__ . DIRECTORY_SEPARATOR . 'mpesa_config.php';
    if (!file_exists($config_file)) {
        return false;
    }
    require_once $config_file;
    return defined('MPESA_CONSUMER_KEY')
        && defined('MPESA_CONSUMER_SECRET')
        && defined('MPESA_PASSKEY')
        && MPESA_CONSUMER_KEY !== 'YOUR_DARAJA_CONSUMER_KEY'
        && MPESA_CONSUMER_SECRET !== 'YOUR_DARAJA_CONSUMER_SECRET'
        && MPESA_PASSKEY !== 'YOUR_DARAJA_PASSKEY';
}

function getHostingCapabilities() {
    $upload_roots = array(
        'uploads' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads',
        'profile_photos' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'profile_photos',
        'gallery' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'gallery',
        'voice_messages' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'voice_messages'
    );
    $writable = array();
    foreach ($upload_roots as $key => $path) {
        if (!is_dir($path)) {
            @mkdir($path, 0755, true);
        }
        $writable[$key] = is_dir($path) && is_writable($path);
    }

    $upload_max = ini_get('upload_max_filesize');
    $post_max = ini_get('post_max_size');
    $curl_loaded = extension_loaded('curl');
    $mpesa_configured = isMpesaConfiguredForHosting();

    return array(
        'php_version' => PHP_VERSION,
        'mysqli_loaded' => extension_loaded('mysqli'),
        'pdo_mysql_loaded' => extension_loaded('pdo_mysql'),
        'curl_loaded' => $curl_loaded,
        'file_uploads' => filter_var(ini_get('file_uploads'), FILTER_VALIDATE_BOOLEAN),
        'upload_max_filesize' => $upload_max,
        'upload_max_bytes' => parseUploadSizeToBytes($upload_max),
        'post_max_size' => $post_max,
        'post_max_bytes' => parseUploadSizeToBytes($post_max),
        'mail_function_available' => function_exists('mail'),
        'smtp_configured' => function_exists('isSmtpConfigured') ? isSmtpConfigured() : false,
        'email_delivery_available' => (function_exists('isSmtpConfigured') && isSmtpConfigured()) || function_exists('mail'),
        'mpesa_configured' => $mpesa_configured,
        'mpesa_stk_available' => $curl_loaded && $mpesa_configured,
        'upload_dirs_writable' => $writable,
        'db_connected' => getDBConnection() instanceof mysqli
    );
}

function uploadContactVoiceFile($field_name = 'voice_message') {
    if (!isset($_FILES[$field_name]) || $_FILES[$field_name]['error'] === UPLOAD_ERR_NO_FILE) {
        return array('success' => false, 'error' => 'Voice message is required');
    }

    if ($_FILES[$field_name]['error'] !== UPLOAD_ERR_OK) {
        return array('success' => false, 'error' => 'Voice message upload failed');
    }

    $max_size = 10 * 1024 * 1024;
    if ($_FILES[$field_name]['size'] > $max_size) {
        return array('success' => false, 'error' => 'Voice message must be 10MB or smaller');
    }

    $tmp_name = $_FILES[$field_name]['tmp_name'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmp_name) ?: ($_FILES[$field_name]['type'] ?? '');
    $allowed = array(
        'audio/webm' => 'webm',
        'video/webm' => 'webm',
        'audio/ogg' => 'ogg',
        'audio/mpeg' => 'mp3',
        'audio/mp3' => 'mp3',
        'audio/mp4' => 'm4a',
        'audio/x-m4a' => 'm4a',
        'audio/wav' => 'wav',
        'audio/x-wav' => 'wav'
    );

    if (!isset($allowed[$mime])) {
        return array('success' => false, 'error' => 'Please upload a valid audio file');
    }

    $upload_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'voice_messages';
    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0755, true)) {
        return array('success' => false, 'error' => 'Could not create voice message upload folder');
    }

    $filename = 'voice_' . date('YmdHis') . '_' . bin2hex(random_bytes(6)) . '.' . $allowed[$mime];
    $destination = $upload_dir . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($tmp_name, $destination)) {
        return array('success' => false, 'error' => 'Could not save voice message');
    }

    return array(
        'success' => true,
        'path' => 'uploads/voice_messages/' . $filename,
        'mime' => $mime,
        'size' => intval($_FILES[$field_name]['size'])
    );
}

function saveMemberGalleryDataMedia($data_url) {
    if (!preg_match('/^data:(image|video)\/(png|jpe?g|gif|webp|mp4|webm|ogg);base64,/', $data_url, $matches)) {
        return array('success' => false, 'error' => 'Unsupported gallery media format');
    }

    $media_type = strtolower($matches[1]);
    $extension = strtolower($matches[2]);
    if ($extension === 'jpeg') $extension = 'jpg';

    $base64 = substr($data_url, strpos($data_url, ',') + 1);
    $media_data = base64_decode($base64, true);
    if ($media_data === false) {
        return array('success' => false, 'error' => 'Invalid gallery media data');
    }

    $max_size = $media_type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (strlen($media_data) > $max_size) {
        return array('success' => false, 'error' => $media_type === 'video' ? 'Video is too large. Please use a video under 50MB.' : 'Image is too large. Please use an image under 5MB.');
    }

    $upload_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'gallery';
    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0755, true)) {
        return array('success' => false, 'error' => 'Could not create gallery upload folder');
    }

    $filename = 'gallery_' . $media_type . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $full_path = $upload_dir . DIRECTORY_SEPARATOR . $filename;

    if (file_put_contents($full_path, $media_data) === false) {
        return array('success' => false, 'error' => 'Could not save gallery media file');
    }

    return array('success' => true, 'path' => 'uploads/gallery/' . $filename, 'media_type' => $media_type);
}

function saveMemberGalleryUpload($file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return array('success' => false, 'error' => 'Gallery media upload failed');
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $image_extensions = array('jpg', 'jpeg', 'png', 'gif', 'webp');
    $video_extensions = array('mp4', 'webm', 'ogg');
    if (in_array($extension, $image_extensions, true)) {
        $media_type = 'image';
        $max_size = 5 * 1024 * 1024;
    } elseif (in_array($extension, $video_extensions, true)) {
        $media_type = 'video';
        $max_size = 50 * 1024 * 1024;
    } else {
        return array('success' => false, 'error' => 'Gallery media must be an image, MP4, WebM, or OGG file');
    }

    if ($file['size'] > $max_size) {
        return array('success' => false, 'error' => $media_type === 'video' ? 'Video is too large. Please use a video under 50MB.' : 'Image is too large. Please use an image under 5MB.');
    }

    if ($extension === 'jpeg') $extension = 'jpg';
    $upload_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'gallery';
    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0755, true)) {
        return array('success' => false, 'error' => 'Could not create gallery upload folder');
    }

    $filename = 'gallery_' . $media_type . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $target = $upload_dir . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($file['tmp_name'], $target)) {
        return array('success' => false, 'error' => 'Could not save gallery media file');
    }

    return array('success' => true, 'path' => 'uploads/gallery/' . $filename, 'media_type' => $media_type);
}

// ============================================
// USER ENDPOINTS
// ============================================

if (($action === 'hostingCheck' || $action === 'getHostingCapabilities') && $method === 'GET') {
    respond(true, 'Hosting capabilities retrieved', getHostingCapabilities());
}

if ($action === 'requestPasswordReset' && $method === 'POST') {
    $email = isset($data['email']) ? $data['email'] : '';
    $result = requestPasswordReset(
        $email,
        $_SERVER['REMOTE_ADDR'] ?? '',
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    );
    if (!$result['success']) {
        respond(false, $result['error']);
    }
    respond(true, 'Reset code sent to your registered email.', $result);
}

if ($action === 'resetPasswordWithCode' && $method === 'POST') {
    $result = resetPasswordWithCode(
        isset($data['email']) ? $data['email'] : '',
        isset($data['code']) ? $data['code'] : '',
        isset($data['password']) ? $data['password'] : ''
    );
    if (!$result['success']) {
        respond(false, $result['error']);
    }
    respond(true, 'Password reset successfully. You can login with your new password.', $result);
}

if ($action === 'addGalleryItem' && $method === 'POST') {
    requirePermission('manage_gallery', $data);
    $title = isset($data['title']) ? trim($data['title']) : '';
    $description = isset($data['description']) ? trim($data['description']) : '';
    $image_url = isset($data['image_url']) ? trim($data['image_url']) : '';
    $media_type = isset($data['media_type']) && $data['media_type'] === 'video' ? 'video' : 'image';
    $uploaded_by = !empty($_SESSION['user']['id']) ? intval($_SESSION['user']['id']) : 0;

    if (isset($_FILES['gallery_media']) && $_FILES['gallery_media']['error'] !== UPLOAD_ERR_NO_FILE) {
        $saved_media = saveMemberGalleryUpload($_FILES['gallery_media']);
        if (!$saved_media['success']) {
            respond(false, $saved_media['error']);
        }
        $image_url = $saved_media['path'];
        $media_type = $saved_media['media_type'];
    }

    if ($title === '' || $image_url === '') {
        respond(false, 'Title and gallery media are required');
    }

    if (strpos($image_url, 'data:image/') === 0 || strpos($image_url, 'data:video/') === 0) {
        $saved_media = saveMemberGalleryDataMedia($image_url);
        if (!$saved_media['success']) {
            respond(false, $saved_media['error']);
        }
        $image_url = $saved_media['path'];
        $media_type = $saved_media['media_type'];
    }

    $result = addGalleryItem(array(
        'title' => $title,
        'description' => $description,
        'image_url' => $image_url,
        'media_type' => $media_type,
        'uploaded_by' => $uploaded_by
    ));
    respond($result['success'], $result['success'] ? 'Gallery item added' : $result['error'], $result);
}

if ($action === 'deleteGalleryItem' && $method === 'DELETE') {
    requirePermission('manage_gallery', $data);
    $gallery_id = isset($data['gallery_id']) ? intval($data['gallery_id']) : 0;
    if ($gallery_id === 0) {
        respond(false, 'Gallery ID required');
    }
    $result = deleteGalleryItem($gallery_id);
    respond($result['success'], $result['success'] ? 'Gallery item deleted' : $result['error'], $result);
}

if ($action === 'getSiteSettings' && $method === 'GET') {
    respond(true, 'Site settings loaded', getSiteSettings());
}

if ($action === 'updateSiteSettings' && $method === 'POST') {
    requirePermission('manage_contact', $data);
    $updated_by = !empty($_SESSION['user']['id']) ? intval($_SESSION['user']['id']) : 0;
    $result = saveSiteSettings($data, $updated_by);
    respond($result['success'], $result['success'] ? 'Site settings updated' : $result['error'], $result);
}

if ($action === 'submitContactVoiceMessage' && $method === 'POST') {
    $upload = uploadContactVoiceFile();
    if (!$upload['success']) {
        respond(false, $upload['error']);
    }

    $result = saveContactVoiceMessage(array(
        'name' => $data['name'] ?? '',
        'email' => $data['email'] ?? '',
        'subject' => $data['subject'] ?? '',
        'message' => $data['message'] ?? '',
        'audio_path' => $upload['path'],
        'audio_mime' => $upload['mime'],
        'audio_size' => $upload['size']
    ));
    respond($result['success'], $result['success'] ? 'Voice message sent' : $result['error'], $result);
}

if ($action === 'getContactVoiceMessages' && $method === 'GET') {
    requirePermission('manage_contact', $data);
    respond(true, 'Voice messages loaded', getContactVoiceMessages());
}

if ($action === 'markContactVoiceMessageRead' && $method === 'POST') {
    requirePermission('manage_contact', $data);
    $listener_id = !empty($_SESSION['user']['id']) ? intval($_SESSION['user']['id']) : 0;
    $result = markContactVoiceMessageRead(intval($data['message_id'] ?? 0), $listener_id);
    respond($result['success'], $result['success'] ? 'Voice message marked as listened' : $result['error'], $result);
}

if ($action === 'registerUser' && $method === 'POST') {
    $username = isset($data['username']) ? $data['username'] : '';
    $email = isset($data['email']) ? $data['email'] : '';
    $password = isset($data['password']) ? $data['password'] : '';
    $role = isset($data['role']) ? $data['role'] : 'student';

    if ($role === 'admin') {
        respond(false, 'Admin accounts must be created from admin.html. Only the first main admin can register there; other admins are added inside the admin panel.');
    }
    
    if (empty($username) || empty($email) || empty($password)) {
        respond(false, 'Missing required fields');
    }
    
    $result = registerUser($username, $email, $password, $role);
    respond($result['success'], $result['success'] ? 'User registered' : $result['error'], $result);
}

if ($action === 'loginUser' && $method === 'POST') {
    $username = isset($data['username']) ? $data['username'] : '';
    $password = isset($data['password']) ? $data['password'] : '';
    
    if (empty($username) || empty($password)) {
        respond(false, 'Username and password required');
    }
    
    $result = loginUser($username, $password);
    if ($result['success'] && isset($result['user'])) {
        session_regenerate_id(true);
        $_SESSION['user'] = $result['user'];
    }
    respond($result['success'], $result['success'] ? 'Login successful' : $result['error'], $result['user'] ?? null);
}

if ($action === 'getSession' && $method === 'GET') {
    if (!empty($_SESSION['user'])) {
        respond(true, 'Session active', $_SESSION['user']);
    }
    respond(false, 'No active session');
}

if ($action === 'logoutUser' && $method === 'POST') {
    unset($_SESSION['user']);
    respond(true, 'Logged out');
}

if ($action === 'getUser' && $method === 'GET') {
    $user_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($user_id === 0) {
        respond(false, 'User ID required');
    }
    
    $user = getUserById($user_id);
    if ($user) {
        unset($user['password']); // Don't send password
        respond(true, 'User found', $user);
    } else {
        respond(false, 'User not found');
    }
}

if ($action === 'getAcademicCatalog' && $method === 'GET') {
    respond(true, 'Academic catalog retrieved', getAcademicCatalog());
}

// ============================================
// STUDENT ENDPOINTS
// ============================================

if ($action === 'registerStudent' && $method === 'POST') {
    $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
    
    if ($user_id === 0) {
        respond(false, 'User ID required');
    }

    $photo_upload = uploadProfilePhoto();
    if (!$photo_upload['success']) {
        respond(false, $photo_upload['error']);
    }
    if ($photo_upload['path'] !== '') {
        $data['passport_photo'] = $photo_upload['path'];
    }
    
    $result = registerStudent($user_id, $data);
    if ($result['success'] && isset($data['passport_photo'])) {
        $result['passport_photo'] = $data['passport_photo'];
    }
    respond($result['success'], $result['success'] ? 'Student registered' : $result['error'], $result);
}

if ($action === 'getStudent' && $method === 'GET') {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    if ($user_id === 0) {
        respond(false, 'User ID required');
    }
    
    $student = getStudentByUserId($user_id);
    if ($student) {
        respond(true, 'Student found', $student);
    } else {
        respond(false, 'Student not found');
    }
}

if ($action === 'getStudentByIdentifier' && $method === 'GET') {
    $identifier = isset($_GET['identifier']) ? $_GET['identifier'] : '';
    if (empty($identifier)) {
        respond(false, 'Identifier required');
    }

    $student = getStudentByIdentifier($identifier);
    if ($student) {
        respond(true, 'Student found', $student);
    } else {
        respond(false, 'Student not found');
    }
}

if ($action === 'ensureStudentRecord' && $method === 'POST') {
    $result = ensureStudentRecord($data);
    respond($result['success'], $result['success'] ? 'Student record ready' : $result['error'], $result);
}

if ($action === 'updateStudentProfile' && $method === 'POST') {
    $student_db_id = isset($data['student_db_id']) ? intval($data['student_db_id']) : 0;
    if ($student_db_id === 0) {
        respond(false, 'Student database ID required');
    }

    if (empty($_SESSION['user'])) {
        respond(false, 'Login required to update profile');
    }
    $conn = getDBConnection();
    $stmt_owner = $conn->prepare("SELECT user_id FROM students WHERE id = ? LIMIT 1");
    $stmt_owner->bind_param("i", $student_db_id);
    $stmt_owner->execute();
    $student_owner = $stmt_owner->get_result()->fetch_assoc();
    if (!$student_owner) {
        respond(false, 'Student profile not found');
    }
    $session_user_id = intval($_SESSION['user']['id'] ?? 0);
    $session_role = $_SESSION['user']['role'] ?? '';
    $permissions = rolePermissions();
    $can_manage_members = isset($permissions[$session_role]) && in_array('manage_members', $permissions[$session_role], true);
    if (intval($student_owner['user_id']) !== $session_user_id && !$can_manage_members) {
        respond(false, 'You can only update your own profile');
    }

    $photo_upload = uploadProfilePhoto();
    if (!$photo_upload['success']) {
        respond(false, $photo_upload['error']);
    }
    if ($photo_upload['path'] !== '') {
        $data['passport_photo'] = $photo_upload['path'];
    }

    $result = updateStudentProfile($student_db_id, $data);
    if ($result['success'] && isset($data['passport_photo'])) {
        $result['passport_photo'] = $data['passport_photo'];
    }
    respond($result['success'], $result['success'] ? 'Profile updated' : $result['error'], $result);
}

if ($action === 'getAllStudents' && $method === 'GET') {
    $query_actor = array(
        'actor_user_id' => isset($_GET['actor_user_id']) ? intval($_GET['actor_user_id']) : 0,
        'actor_role' => isset($_GET['actor_role']) ? $_GET['actor_role'] : ''
    );
    requirePermission('manage_members', $query_actor);
    $students = getAllStudents();
    respond(true, 'Students retrieved', $students);
}

if ($action === 'updateStudentStatus' && $method === 'POST') {
    requirePermission('manage_members', $data);
    $student_db_id = isset($data['student_db_id']) ? intval($data['student_db_id']) : 0;
    $status = isset($data['status']) ? $data['status'] : '';
    if ($student_db_id === 0 || $status === '') {
        respond(false, 'Student database ID and status are required');
    }

    $result = updateStudentStatus($student_db_id, $status);
    respond($result['success'], $result['success'] ? 'Student status updated' : $result['error'], $result);
}

if ($action === 'deleteStudent' && $method === 'POST') {
    requirePermission('manage_members', $data);
    $student_db_id = isset($data['student_db_id']) ? intval($data['student_db_id']) : 0;
    if ($student_db_id === 0) {
        respond(false, 'Student database ID required');
    }

    $result = deleteStudentRecord($student_db_id);
    respond($result['success'], $result['success'] ? 'Student deleted' : $result['error'], $result);
}

// ============================================
// EVENT ENDPOINTS
// ============================================

if ($action === 'createEvent' && $method === 'POST') {
    requirePermission('manage_events', $data);
    $result = createEvent($data);
    respond($result['success'], $result['success'] ? 'Event created' : $result['error'], $result);
}

if ($action === 'getUpcomingEvents' && $method === 'GET') {
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $events = getUpcomingEvents($limit);
    respond(true, 'Events retrieved', $events);
}

if ($action === 'registerEvent' && $method === 'POST') {
    $event_id = isset($data['event_id']) ? intval($data['event_id']) : 0;
    $student_id = isset($data['student_id']) ? intval($data['student_id']) : 0;
    
    if ($event_id === 0 || $student_id === 0) {
        respond(false, 'Event ID and Student ID required');
    }
    
    $result = registerEventAttendee($event_id, $student_id);
    respond($result['success'], $result['success'] ? 'Registered for event' : $result['error'], $result);
}

// ============================================
// PRAYER TIMES ENDPOINTS
// ============================================

if ($action === 'getPrayerTimes' && $method === 'GET') {
    $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
    $prayer_times = getPrayerTimes($date);
    
    if ($prayer_times) {
        respond(true, 'Prayer times retrieved', $prayer_times);
    } else {
        respond(false, 'Prayer times not found for this date');
    }
}

if ($action === 'setPrayerTimes' && $method === 'POST') {
    requirePermission('manage_prayer_times', $data);
    $date = isset($data['date']) ? $data['date'] : date('Y-m-d');
    
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
    respond($result['success'], $result['success'] ? 'Prayer times saved' : $result['error'], $result);
}

// ============================================
// ACTIVITY ENDPOINTS
// ============================================

if ($action === 'getActivities' && $method === 'GET') {
    $activities = getActivities(false);
    respond(true, 'Activities retrieved', $activities);
}

if ($action === 'createActivity' && $method === 'POST') {
    requirePermission('manage_activities', $data);
    if (empty($data['created_by'])) {
        $data['created_by'] = $_SESSION['user']['id'] ?? ($data['actor_user_id'] ?? 0);
    }
    $result = createActivity($data);
    respond($result['success'], $result['success'] ? 'Activity created' : $result['error'], $result);
}

if ($action === 'deleteActivity' && $method === 'DELETE') {
    requirePermission('manage_activities', $data);
    $activity_id = isset($_GET['id']) ? intval($_GET['id']) : intval($data['activity_id'] ?? 0);
    $result = deleteActivityRecord($activity_id);
    respond($result['success'], $result['success'] ? 'Activity deleted' : $result['error'], $result);
}

// ============================================
// HADITH ENDPOINTS
// ============================================

if ($action === 'getHadiths' && $method === 'GET') {
    respond(true, 'Hadiths retrieved', getAllHadiths());
}

if ($action === 'getDailyHadith' && $method === 'GET') {
    $hadith = getDailyHadith();
    if ($hadith) {
        respond(true, 'Daily hadith retrieved', $hadith);
    }
    respond(false, 'No hadith available');
}

if ($action === 'addHadith' && $method === 'POST') {
    requirePermission('manage_hadiths', $data);
    $arabic = isset($data['arabic']) ? trim($data['arabic']) : '';
    $english = isset($data['english']) ? trim($data['english']) : '';
    if ($arabic === '' || $english === '') {
        respond(false, 'Arabic and English texts are required');
    }

    $result = addHadith(array(
        'arabic' => $arabic,
        'english' => $english,
        'reference' => isset($data['reference']) ? trim($data['reference']) : '',
        'source' => isset($data['source']) ? trim($data['source']) : '',
        'category' => isset($data['category']) ? trim($data['category']) : '',
        'added_by' => !empty($_SESSION['user']['id']) ? intval($_SESSION['user']['id']) : intval($data['actor_user_id'] ?? 0)
    ));
    respond($result['success'], $result['success'] ? 'Hadith added successfully' : $result['error'], $result);
}

if ($action === 'deleteHadith' && $method === 'DELETE') {
    requirePermission('manage_hadiths', $data);
    $hadith_id = isset($data['hadith_id']) ? intval($data['hadith_id']) : intval($_GET['id'] ?? 0);
    if ($hadith_id <= 0) {
        respond(false, 'Hadith ID required');
    }
    $result = deleteHadith($hadith_id);
    respond($result['success'], $result['success'] ? 'Hadith deleted' : $result['error'], $result);
}

// ============================================
// WELFARE ENDPOINTS
// ============================================

if ($action === 'createWelfareRequest' && $method === 'POST') {
    $student_id = isset($data['student_id']) ? intval($data['student_id']) : 0;
    $category = isset($data['category']) ? $data['category'] : '';
    $description = isset($data['description']) ? $data['description'] : '';
    $amount = isset($data['amount']) ? floatval($data['amount']) : 0;
    
    if ($student_id === 0 || empty($category) || empty($description)) {
        respond(false, 'Missing required fields');
    }
    
    $result = createWelfareRequest($student_id, $category, $description, $amount);
    respond($result['success'], $result['success'] ? 'Welfare request created' : $result['error'], $result);
}

if ($action === 'getPendingWelfare' && $method === 'GET') {
    $query_actor = array(
        'actor_user_id' => isset($_GET['actor_user_id']) ? intval($_GET['actor_user_id']) : 0,
        'actor_role' => isset($_GET['actor_role']) ? $_GET['actor_role'] : ''
    );
    requirePermission('manage_welfare', $query_actor);
    $requests = getPendingWelfareRequests();
    respond(true, 'Welfare requests retrieved', $requests);
}

if ($action === 'approveWelfare' && $method === 'POST') {
    requirePermission('manage_welfare', $data);
    $request_id = isset($data['request_id']) ? intval($data['request_id']) : 0;
    $approved_by = isset($data['approved_by']) ? intval($data['approved_by']) : 0;
    $notes = isset($data['notes']) ? $data['notes'] : '';
    
    if ($request_id === 0 || $approved_by === 0) {
        respond(false, 'Request ID and Approved By required');
    }
    
    $result = approveWelfareRequest($request_id, $approved_by, $notes);
    respond($result['success'], $result['success'] ? 'Welfare approved' : $result['error'], $result);
}

// ============================================
// PAYMENT ENDPOINTS
// ============================================

if ($action === 'getPaymentRecords' && $method === 'GET') {
    $query_actor = array(
        'actor_user_id' => isset($_GET['actor_user_id']) ? intval($_GET['actor_user_id']) : 0,
        'actor_role' => isset($_GET['actor_role']) ? $_GET['actor_role'] : ''
    );
    requirePermission('manage_payments', $query_actor);
    respond(true, 'Payment records retrieved', getPaymentRecordsForTreasurer());
}

if ($action === 'recordPayment' && $method === 'POST') {
    $student_id = isset($data['student_id']) ? intval($data['student_id']) : 0;
    $payment_type = isset($data['payment_type']) ? $data['payment_type'] : '';
    $amount = isset($data['amount']) ? floatval($data['amount']) : 0;
    $due_date = isset($data['due_date']) ? $data['due_date'] : '';
    $payment_method = isset($data['payment_method']) ? $data['payment_method'] : null;
    $transaction_id = isset($data['transaction_id']) ? $data['transaction_id'] : null;
    $notes = isset($data['notes']) ? $data['notes'] : null;
    $status = isset($data['status']) ? $data['status'] : 'pending';
    
    if ($student_id === 0 || empty($payment_type) || $amount === 0 || empty($transaction_id)) {
        respond(false, 'Missing required fields');
    }
    
    $result = recordPayment($student_id, $payment_type, $amount, $due_date, $payment_method, $transaction_id, $notes, $status);
    respond($result['success'], $result['success'] ? 'Payment recorded' : $result['error'], $result);
}

if ($action === 'completePayment' && $method === 'POST') {
    requirePermission('manage_payments', $data);
    $payment_id = isset($data['payment_id']) ? intval($data['payment_id']) : 0;
    $transaction_id = isset($data['transaction_id']) ? $data['transaction_id'] : null;
    
    if ($payment_id === 0) {
        respond(false, 'Payment ID required');
    }
    
    $approved_by = !empty($_SESSION['user']['id']) ? intval($_SESSION['user']['id']) : 0;
    $result = completePayment($payment_id, $transaction_id, $approved_by);
    respond($result['success'], $result['success'] ? 'Payment completed' : $result['error'], $result);
}

if ($action === 'updatePaymentStatus' && $method === 'POST') {
    requirePermission('manage_payments', $data);
    $payment_id = isset($data['payment_id']) ? intval($data['payment_id']) : 0;
    $status = isset($data['status']) ? $data['status'] : '';
    $transaction_id = isset($data['transaction_id']) ? $data['transaction_id'] : null;
    $notes = isset($data['notes']) ? $data['notes'] : null;

    if ($payment_id === 0 || $status === '') {
        respond(false, 'Payment ID and status are required');
    }

    $approved_by = !empty($_SESSION['user']['id']) ? intval($_SESSION['user']['id']) : 0;
    $result = updatePaymentStatus($payment_id, $status, $transaction_id, $notes, $approved_by);
    respond($result['success'], $result['success'] ? 'Payment status updated' : $result['error'], $result);
}

// ============================================
// DONATION ENDPOINTS
// ============================================

if ($action === 'getDonationRecords' && $method === 'GET') {
    $query_actor = array(
        'actor_user_id' => isset($_GET['actor_user_id']) ? intval($_GET['actor_user_id']) : 0,
        'actor_role' => isset($_GET['actor_role']) ? $_GET['actor_role'] : ''
    );
    requirePermission('manage_payments', $query_actor);
    respond(true, 'Donation records retrieved', getDonationRecordsForTreasurer());
}

if ($action === 'recordDonation' && $method === 'POST') {
    $donor_id = isset($data['donor_id']) ? intval($data['donor_id']) : null;
    $donor_name = isset($data['donor_name']) ? $data['donor_name'] : '';
    $donor_email = isset($data['donor_email']) ? $data['donor_email'] : '';
    $amount = isset($data['amount']) ? floatval($data['amount']) : 0;
    $donation_type = isset($data['donation_type']) ? $data['donation_type'] : '';
    $purpose = isset($data['purpose']) ? $data['purpose'] : '';
    $payment_method = isset($data['payment_method']) ? $data['payment_method'] : null;
    $transaction_id = isset($data['transaction_id']) ? $data['transaction_id'] : null;
    $status = isset($data['status']) ? $data['status'] : 'pending';
    
    if (empty($donor_name) || empty($donor_email) || $amount === 0 || empty($transaction_id)) {
        respond(false, 'Missing required fields');
    }
    
    $result = recordDonation($donor_id, $donor_name, $donor_email, $amount, $donation_type, $purpose, $payment_method, $transaction_id, $status);
    respond($result['success'], $result['success'] ? 'Donation recorded' : $result['error'], $result);
}

if ($action === 'updateDonationStatus' && $method === 'POST') {
    requirePermission('manage_payments', $data);
    $donation_id = isset($data['donation_id']) ? intval($data['donation_id']) : 0;
    $status = isset($data['status']) ? $data['status'] : '';
    $transaction_id = isset($data['transaction_id']) ? $data['transaction_id'] : null;

    if ($donation_id === 0 || $status === '') {
        respond(false, 'Donation ID and status are required');
    }

    $approved_by = !empty($_SESSION['user']['id']) ? intval($_SESSION['user']['id']) : 0;
    $result = updateDonationStatus($donation_id, $status, $transaction_id, $approved_by);
    respond($result['success'], $result['success'] ? 'Donation status updated' : $result['error'], $result);
}

if ($action === 'getDonationStats' && $method === 'GET') {
    $year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');
    $stats = getTotalDonations($year);
    respond(true, 'Donation stats retrieved', $stats);
}

// ============================================
// LEADERSHIP ENDPOINTS
// ============================================

if ($action === 'assignLeadership' && $method === 'POST') {
    requirePermission('manage_leadership', $data);
    $student_id = isset($data['student_id']) ? intval($data['student_id']) : 0;
    $position = isset($data['position']) ? $data['position'] : '';
    $department = isset($data['department']) ? $data['department'] : '';
    $start_date = isset($data['start_date']) ? $data['start_date'] : '';
    
    if ($student_id === 0 || empty($position) || empty($start_date)) {
        respond(false, 'Missing required fields');
    }
    
    $result = assignLeadershipRole($student_id, $position, $department, $start_date);
    respond($result['success'], $result['success'] ? 'Leadership role assigned' : $result['error'], $result);
}

if ($action === 'getLeadership' && $method === 'GET') {
    $leadership = getCurrentLeadership();
    respond(true, 'Leadership retrieved', $leadership);
}

// ============================================
// ANNOUNCEMENT ENDPOINTS
// ============================================

if ($action === 'createAnnouncement' && $method === 'POST') {
    requirePermission('create_announcements', $data);
    $title = isset($data['title']) ? $data['title'] : '';
    $content = isset($data['content']) ? $data['content'] : '';
    $author_id = isset($data['author_id']) ? intval($data['author_id']) : 0;
    $priority = isset($data['priority']) ? $data['priority'] : 'medium';
    $expires_at = isset($data['expires_at']) ? $data['expires_at'] : null;
    
    if (empty($title) || empty($content) || $author_id === 0) {
        respond(false, 'Missing required fields');
    }
    
    $result = createAnnouncement($title, $content, $author_id, $priority, $expires_at);
    respond($result['success'], $result['success'] ? 'Announcement created' : $result['error'], $result);
}

if ($action === 'getAnnouncements' && $method === 'GET') {
    $announcements = getActiveAnnouncements();
    respond(true, 'Announcements retrieved', $announcements);
}

// ============================================
// VOLUNTEER ENDPOINTS
// ============================================

if ($action === 'createVolunteerOp' && $method === 'POST') {
    requirePermission('manage_events', $data);
    $title = isset($data['title']) ? $data['title'] : '';
    $description = isset($data['description']) ? $data['description'] : '';
    $required_hours = isset($data['required_hours']) ? intval($data['required_hours']) : 0;
    $start_date = isset($data['start_date']) ? $data['start_date'] : '';
    $end_date = isset($data['end_date']) ? $data['end_date'] : '';
    $duration = isset($data['duration']) ? $data['duration'] : ($data['schedule'] ?? '');
    $created_by = isset($data['created_by']) ? intval($data['created_by']) : 0;
    if ($created_by === 0) {
        $created_by = intval($_SESSION['user']['id'] ?? ($data['actor_user_id'] ?? 0));
    }
    
    if (empty($title) || $required_hours === 0 || $created_by === 0) {
        respond(false, 'Missing required fields');
    }
    
    $result = createVolunteerOpportunity($title, $description, $required_hours, $start_date, $end_date, $created_by, $duration);
    respond($result['success'], $result['success'] ? 'Volunteer opportunity created' : $result['error'], $result);
}

if ($action === 'getVolunteerOps' && $method === 'GET') {
    respond(true, 'Volunteer opportunities retrieved', getVolunteerOpportunitiesFromDb(false));
}

if ($action === 'registerVolunteer' && $method === 'POST') {
    requirePermission('register_volunteer', $data);
    $opportunity_id = isset($data['opportunity_id']) ? intval($data['opportunity_id']) : 0;
    $student_id = isset($data['student_id']) ? intval($data['student_id']) : 0;
    $skills = isset($data['skills']) ? $data['skills'] : '';
    $availability = isset($data['availability']) ? $data['availability'] : '';
    
    if ($opportunity_id === 0 || $student_id === 0) {
        respond(false, 'Opportunity ID and Student ID required');
    }
    
    $result = registerVolunteer($opportunity_id, $student_id, $skills, $availability);
    respond($result['success'], $result['success'] ? 'Volunteer registered' : $result['error'], $result);
}

if ($action === 'getVolunteerRegistrations' && $method === 'GET') {
    $query_actor = array(
        'actor_user_id' => isset($_GET['actor_user_id']) ? intval($_GET['actor_user_id']) : 0,
        'actor_role' => isset($_GET['actor_role']) ? $_GET['actor_role'] : ''
    );
    $student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;
    $can_manage_events = false;
    if (!empty($_SESSION['user']['role'])) {
        $permissions = rolePermissions();
        $role = $_SESSION['user']['role'];
        $can_manage_events = isset($permissions[$role]) && in_array('manage_events', $permissions[$role], true);
    }
    if ($can_manage_events) {
        respond(true, 'Volunteer registrations retrieved', getVolunteerRegistrationsFromDb(0));
    }
    respond(true, 'Volunteer registrations retrieved', getVolunteerRegistrationsFromDb($student_id));
}

if ($action === 'updateVolunteerRegistration' && $method === 'POST') {
    requirePermission('manage_events', $data);
    $registration_id = isset($data['registration_id']) ? intval($data['registration_id']) : 0;
    $status = isset($data['status']) ? $data['status'] : '';
    $hours_completed = array_key_exists('hours_completed', $data) ? intval($data['hours_completed']) : null;
    if ($registration_id === 0 || $status === '') {
        respond(false, 'Registration ID and status are required');
    }
    $result = updateVolunteerRegistrationStatus($registration_id, $status, $hours_completed);
    respond($result['success'], $result['success'] ? 'Volunteer registration updated' : $result['error'], $result);
}

// ============================================
// DATABASE STATUS
// ============================================

if ($action === 'dbStatus' && $method === 'GET') {
    $status = getDatabaseStatus();
    respond(true, 'Database status retrieved', $status);
}

// Default response
respond(false, 'Invalid action or method');

?>
