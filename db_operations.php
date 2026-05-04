<?php
// COMMUJ Database Operations Helper

require_once 'database.php';

// ============================================
// USER OPERATIONS
// ============================================

function registerUser($username, $email, $password, $role = 'student') {
    $conn = getDBConnection();
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    
    $sql = "INSERT INTO users (username, email, password, role, status) 
            VALUES (?, ?, ?, ?, 'active')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $username, $email, $hashed_password, $role);
    
    if ($stmt->execute()) {
        return array('success' => true, 'user_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function loginUser($username, $password) {
    $conn = getDBConnection();
    $sql = "SELECT id, username, email, role, status FROM users WHERE username = ? OR email = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $sql_pass = "SELECT password FROM users WHERE id = ?";
        $stmt_pass = $conn->prepare($sql_pass);
        $stmt_pass->bind_param("i", $user['id']);
        $stmt_pass->execute();
        $pass_result = $stmt_pass->get_result()->fetch_assoc();
        
        if (password_verify($password, $pass_result['password'])) {
            // Update last login
            $update_login = "UPDATE users SET last_login = NOW() WHERE id = ?";
            $stmt_login = $conn->prepare($update_login);
            $stmt_login->bind_param("i", $user['id']);
            $stmt_login->execute();
            
            return array('success' => true, 'user' => $user);
        }
    }
    
    return array('success' => false, 'error' => 'Invalid credentials');
}

function getUserById($user_id) {
    $conn = getDBConnection();
    $sql = "SELECT * FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

// ============================================
// STUDENT OPERATIONS
// ============================================

function registerStudent($user_id, $data) {
    $conn = getDBConnection();
    
    $sql = "INSERT INTO students 
            (user_id, first_name, last_name, student_id, email, phone, gender, 
             nationality, course, year_of_study, degree_type, home_address, 
             emergency_contact, emergency_contact_phone, local_guardian, local_guardian_phone, joined_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "isssssssssssssss",
        $user_id,
        $data['first_name'],
        $data['last_name'],
        $data['student_id'],
        $data['email'],
        $data['phone'],
        $data['gender'],
        $data['nationality'],
        $data['course'],
        $data['year_of_study'],
        $data['degree_type'],
        $data['home_address'],
        $data['emergency_contact'],
        $data['emergency_contact_phone'],
        $data['local_guardian'],
        $data['local_guardian_phone'],
        $today
    );
    
    if ($stmt->execute()) {
        return array('success' => true, 'student_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getStudentByUserId($user_id) {
    $conn = getDBConnection();
    $sql = "SELECT * FROM students WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getAllStudents() {
    return fetchAll("SELECT * FROM students ORDER BY first_name ASC");
}

// ============================================
// EVENT OPERATIONS
// ============================================

function createEvent($data) {
    $conn = getDBConnection();
    
    $sql = "INSERT INTO events 
            (title, description, event_date, location, category, organizer_id, status, max_participants)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssssi",
        $data['title'],
        $data['description'],
        $data['event_date'],
        $data['location'],
        $data['category'],
        $data['organizer_id'],
        $data['status'],
        $data['max_participants']
    );
    
    if ($stmt->execute()) {
        return array('success' => true, 'event_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getUpcomingEvents($limit = 10) {
    $conn = getDBConnection();
    $sql = "SELECT * FROM events WHERE event_date > NOW() 
            ORDER BY event_date ASC LIMIT ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $limit);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
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
        return array('success' => false, 'error' => $stmt->error);
    }
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

function recordPayment($student_id, $payment_type, $amount, $due_date, $payment_method = null) {
    $conn = getDBConnection();
    
    $sql = "INSERT INTO payments 
            (student_id, payment_type, amount, due_date, payment_method, status)
            VALUES (?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isdss", $student_id, $payment_type, $amount, $due_date, $payment_method);
    
    if ($stmt->execute()) {
        return array('success' => true, 'payment_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function completePayment($payment_id, $transaction_id = null) {
    $conn = getDBConnection();
    
    $sql = "UPDATE payments 
            SET status = 'completed', paid_date = NOW(), transaction_id = ?
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $transaction_id, $payment_id);
    
    if ($stmt->execute()) {
        return array('success' => true);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

// ============================================
// DONATION OPERATIONS
// ============================================

function recordDonation($donor_id, $donor_name, $donor_email, $amount, $donation_type, $purpose) {
    $conn = getDBConnection();
    
    $sql = "INSERT INTO donations 
            (donor_id, donor_name, donor_email, amount, donation_type, purpose, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issdss", $donor_id, $donor_name, $donor_email, $amount, $donation_type, $purpose);
    
    if ($stmt->execute()) {
        return array('success' => true, 'donation_id' => $conn->insert_id);
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
    
    $sql = "INSERT INTO announcements 
            (title, content, author_id, priority, expires_at)
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $title, $content, $author_id, $priority, $expires_at);
    
    if ($stmt->execute()) {
        return array('success' => true, 'announcement_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getActiveAnnouncements() {
    return fetchAll("SELECT a.*, u.username as author_name 
                     FROM announcements a
                     JOIN users u ON a.author_id = u.id
                     WHERE (a.expires_at IS NULL OR a.expires_at > NOW())
                     ORDER BY a.priority DESC, a.published_at DESC");
}

// ============================================
// VOLUNTEER OPERATIONS
// ============================================

function createVolunteerOpportunity($title, $description, $required_hours, $start_date, $end_date, $created_by) {
    $conn = getDBConnection();
    
    $sql = "INSERT INTO volunteer_opportunities 
            (title, description, required_hours, start_date, end_date, created_by, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssissi", $title, $description, $required_hours, $start_date, $end_date, $created_by);
    
    if ($stmt->execute()) {
        return array('success' => true, 'opportunity_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function registerVolunteer($opportunity_id, $student_id) {
    $conn = getDBConnection();
    
    $sql = "INSERT INTO volunteer_registrations 
            (volunteer_opportunity_id, student_id, status)
            VALUES (?, ?, 'registered')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $opportunity_id, $student_id);
    
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
    
    // Check if leadership_profiles table exists, if not create it
    $create_table = "CREATE TABLE IF NOT EXISTS leadership_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
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
    
    $sql = "INSERT INTO leadership_profiles 
            (name, position, bio, description, email, phone, photo_url, user_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssssii",
        $leader_data['name'],
        $leader_data['position'],
        $leader_data['bio'],
        $leader_data['description'],
        $leader_data['email'],
        $leader_data['phone'],
        $leader_data['photo_url'],
        $leader_data['user_id']
    );
    
    if ($stmt->execute()) {
        return array('success' => true, 'leader_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getPublicLeaders() {
    $conn = getDBConnection();
    
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
    
    // Check if gallery table exists, if not create it
    $create_table = "CREATE TABLE IF NOT EXISTS gallery (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active',
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    )";
    $conn->query($create_table);
    
    $sql = "INSERT INTO gallery 
            (title, description, image_url, uploaded_by, status)
            VALUES (?, ?, ?, ?, 'active')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssi",
        $gallery_data['title'],
        $gallery_data['description'],
        $gallery_data['image_url'],
        $gallery_data['uploaded_by']
    );
    
    if ($stmt->execute()) {
        return array('success' => true, 'gallery_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function getGalleryItems() {
    $conn = getDBConnection();
    
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

function fetchAll($sql) {
    $conn = getDBConnection();
    $result = $conn->query($sql);
    if ($result) {
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    return array();
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
// HADITH MANAGEMENT
// ============================================

function createHadithTable() {
    $conn = getDBConnection();
    
    $create_table = "CREATE TABLE IF NOT EXISTS hadiths (
        id INT PRIMARY KEY AUTO_INCREMENT,
        arabic TEXT NOT NULL,
        english TEXT NOT NULL,
        reference VARCHAR(255),
        source VARCHAR(100),
        category VARCHAR(100),
        added_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active',
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
    )";
    
    $conn->query($create_table);
}

function addHadith($hadith_data) {
    $conn = getDBConnection();
    
    createHadithTable();
    
    $sql = "INSERT INTO hadiths 
            (arabic, english, reference, source, category, added_by, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssi",
        $hadith_data['arabic'],
        $hadith_data['english'],
        $hadith_data['reference'],
        $hadith_data['source'],
        $hadith_data['category'],
        $hadith_data['added_by']
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
    
    $sql = "SELECT * FROM hadiths 
            WHERE status = 'active'
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
    
    $sql = "SELECT * FROM hadiths WHERE status = 'active' ORDER BY id ASC";
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
    
    $sql = "SELECT * FROM hadiths WHERE id = ? AND status = 'active'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $hadith_id);
    $stmt->execute();
    
    return $stmt->get_result()->fetch_assoc();
}

function updateHadith($hadith_id, $hadith_data) {
    $conn = getDBConnection();
    
    $sql = "UPDATE hadiths 
            SET arabic = ?, english = ?, reference = ?, source = ?, category = ?
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

function getDBConnection() {
    global $conn;
    return $conn;
}

?>
