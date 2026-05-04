<?php
// COMMUJ Admin Content Management API
// This file handles admin panel actions for content management

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'database.php';
require_once 'db_operations.php';

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];

// Parse JSON body if POST/PUT
$data = array();
if ($method === 'POST' || $method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
}

// Response helper
function respond($success, $message = '', $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// ============================================
// ANNOUNCEMENTS MANAGEMENT
// ============================================

if ($action === 'createAnnouncement' && $method === 'POST') {
    $title = isset($data['title']) ? $data['title'] : '';
    $content = isset($data['content']) ? $data['content'] : '';
    $author_id = isset($data['author_id']) ? $data['author_id'] : '';
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
    $capacity = isset($data['capacity']) ? intval($data['capacity']) : null;
    
    if (empty($title) || empty($description) || empty($event_date)) {
        respond(false, 'Title, description, and date are required');
    }
    
    $event_data = [
        'title' => $title,
        'description' => $description,
        'event_date' => $event_date,
        'location' => $location,
        'organizer_id' => $organizer_id,
        'capacity' => $capacity
    ];
    
    $result = createEvent($event_data);
    respond($result['success'], $result['success'] ? 'Event created' : 'Error creating event', $result);
}

if ($action === 'getEvents' && $method === 'GET') {
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $events = getUpcomingEvents($limit);
    respond(true, 'Events retrieved', $events);
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
    $name = isset($data['name']) ? $data['name'] : '';
    $position = isset($data['position']) ? $data['position'] : '';
    $bio = isset($data['bio']) ? $data['bio'] : '';
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
        'description' => $description,
        'email' => $email,
        'phone' => $phone,
        'user_id' => $user_id,
        'photo_url' => isset($data['photo_url']) ? $data['photo_url'] : null
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
    
    $gallery_data = [
        'title' => $title,
        'description' => $description,
        'image_url' => $image_url,
        'uploaded_by' => $uploaded_by
    ];
    
    $result = addGalleryItem($gallery_data);
    respond($result['success'], $result['success'] ? 'Gallery item added' : 'Error adding gallery item', $result);
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
