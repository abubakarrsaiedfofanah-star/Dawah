<?php
// Dawa'ah Database Operations Helper

require_once 'database.php';

// ============================================
// USER OPERATIONS
// ============================================

function registerUser($username, $email, $password, $role = 'student') {
    $conn = getDBConnection();
    ensureUserRoleColumn();
    $role = trim($role) !== '' ? trim($role) : 'student';
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
            return array('success' => false, 'error' => ucfirst($role) . ' role is already registered. Admin must delete the existing account before another can register.');
        }
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $status = in_array($role, array('student', 'admin'), true) ? 'active' : 'inactive';
    
    $sql = "INSERT INTO users (username, email, password, role, status) 
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $username, $email, $hashed_password, $role, $status);
    
    if ($stmt->execute()) {
        return array('success' => true, 'user_id' => $conn->insert_id);
    } else {
        return array('success' => false, 'error' => $stmt->error);
    }
}

function loginUser($username, $password) {
    $conn = getDBConnection();
    ensureUserRoleColumn();
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
    }
    
    return array('success' => false, 'error' => 'Invalid credentials');
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

function ensureUserRoleColumn() {
    $conn = getDBConnection();
    if (!tableExists('users')) {
        return;
    }
    $conn->query("ALTER TABLE users MODIFY role ENUM('student', 'executive', 'chairman', 'chairlady', 'secretary', 'treasurer', 'imam', 'admin') DEFAULT 'student'");
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
    
    $sql = "INSERT INTO students 
            (user_id, first_name, last_name, student_id, email, phone, gender, 
             nationality, school, course, year_of_study, semester, degree_type, home_address, 
             emergency_contact, emergency_contact_phone, local_guardian, local_guardian_phone, passport_photo, joined_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "isssssssssssssssssss",
        $user_id,
        $data['first_name'],
        $data['last_name'],
        $data['student_id'],
        $data['email'],
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

    $stmt = $conn->prepare("UPDATE students SET membership_status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $student_db_id);
    if (!$stmt->execute()) {
        return array('success' => false, 'error' => $stmt->error);
    }

    $stmt_find = $conn->prepare("SELECT user_id FROM students WHERE id = ?");
    $stmt_find->bind_param("i", $student_db_id);
    $stmt_find->execute();
    $student = $stmt_find->get_result()->fetch_assoc();
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

function recordPayment($student_id, $payment_type, $amount, $due_date, $payment_method = null, $transaction_id = null, $notes = null, $status = 'completed') {
    $conn = getDBConnection();
    $status = in_array($status, array('pending', 'completed', 'late', 'waived'), true) ? $status : 'completed';
    
    $sql = "INSERT INTO payments 
            (student_id, payment_type, amount, due_date, payment_method, transaction_id, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isdsssss", $student_id, $payment_type, $amount, $due_date, $payment_method, $transaction_id, $notes, $status);
    
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

function recordDonation($donor_id, $donor_name, $donor_email, $amount, $donation_type, $purpose, $payment_method = null, $transaction_id = null, $status = 'completed') {
    $conn = getDBConnection();
    $donor_id = intval($donor_id) > 0 && getUserById(intval($donor_id)) ? intval($donor_id) : null;
    $status = in_array($status, array('pending', 'completed', 'failed'), true) ? $status : 'completed';
    $receipt_issued = $status === 'completed' ? 1 : 0;
    
    $sql = "INSERT INTO donations 
            (donor_id, donor_name, donor_email, amount, donation_type, purpose, payment_method, transaction_id, status, receipt_issued)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issdsssssi", $donor_id, $donor_name, $donor_email, $amount, $donation_type, $purpose, $payment_method, $transaction_id, $status, $receipt_issued);
    
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

function updatePaymentStatus($payment_id, $status, $transaction_id = null, $notes = null) {
    $conn = getDBConnection();
    $status = strtolower(trim($status));
    if (!in_array($status, array('pending', 'completed', 'late', 'waived'), true)) {
        return array('success' => false, 'error' => 'Invalid payment status');
    }

    $sql = "UPDATE payments
            SET status = ?,
                paid_date = CASE WHEN ? = 'completed' THEN NOW() ELSE paid_date END,
                transaction_id = COALESCE(?, transaction_id),
                notes = COALESCE(?, notes)
            WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssi", $status, $status, $transaction_id, $notes, $payment_id);

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
    if ($uploaded_by !== null && !getUserById($uploaded_by)) {
        $uploaded_by = null;
    }
    
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

function completeDonation($donation_id, $transaction_id = null) {
    $conn = getDBConnection();
    $receipt_issued = 1;

    $sql = "UPDATE donations
            SET status = 'completed', transaction_id = ?, receipt_issued = ?
            WHERE id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sii", $transaction_id, $receipt_issued, $donation_id);

    if ($stmt->execute()) {
        return array('success' => true);
    }
    return array('success' => false, 'error' => $stmt->error);
}

function updateDonationStatus($donation_id, $status, $transaction_id = null) {
    $conn = getDBConnection();
    $status = strtolower(trim($status));
    if (!in_array($status, array('pending', 'completed', 'failed'), true)) {
        return array('success' => false, 'error' => 'Invalid donation status');
    }
    $receipt_issued = $status === 'completed' ? 1 : 0;

    $sql = "UPDATE donations
            SET status = ?, transaction_id = COALESCE(?, transaction_id), receipt_issued = ?
            WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssii", $status, $transaction_id, $receipt_issued, $donation_id);

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
        'completed_payments' => countRows('payments', "status = 'completed'"),
        'payment_total' => sumColumn('payments', 'amount', "status = 'completed'"),
        'donations' => countRows('donations'),
        'completed_donations' => countRows('donations', "status = 'completed'"),
        'donation_total' => sumColumn('donations', 'amount', "status = 'completed'"),
        'resources' => countRows('resources'),
        'gallery' => countRows('gallery'),
        'leaders' => countRows('leadership_profiles', "status = 'active'"),
        'hadiths' => countRows('hadiths'),
        'prayer_days' => countRows('prayer_times'),
        'volunteer_opportunities' => countRows('volunteer_opportunities')
    );
}

function getAdminDashboardDetail($type) {
    if ($type === 'gallery' && tableExists('gallery')) {
        $conn = getDBConnection();
        $conn->query("UPDATE gallery SET image_url = 'uploads/gallery/sample-gallery.svg' WHERE image_url LIKE '%via.placeholder.com%' OR image_url = ''");
    }

    $queries = array(
        'members' => array('table' => 'users', 'sql' => "SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 100"),
        'students' => array('table' => 'students', 'sql' => "SELECT id, student_id, first_name, last_name, email, phone, course, year_of_study, semester, passport_photo, membership_status, created_at FROM students ORDER BY created_at DESC LIMIT 100"),
        'donations' => array('table' => 'donations', 'sql' => "SELECT id, donor_name, donor_email, amount, donation_type, purpose, payment_method, transaction_id, status, receipt_issued, created_at FROM donations ORDER BY created_at DESC LIMIT 100"),
        'payments' => array('table' => 'payments', 'sql' => "SELECT p.id, s.student_id, s.first_name, s.last_name, s.email, p.payment_type, p.amount, p.status, p.payment_method, p.transaction_id, p.notes, p.created_at FROM payments p LEFT JOIN students s ON p.student_id = s.id ORDER BY p.created_at DESC LIMIT 100"),
        'welfare' => array('table' => 'welfare_requests', 'sql' => "SELECT wr.id, s.student_id, s.first_name, s.last_name, wr.category, wr.amount_needed, wr.status, wr.created_at FROM welfare_requests wr LEFT JOIN students s ON wr.student_id = s.id ORDER BY wr.created_at DESC LIMIT 100"),
        'events' => array('table' => 'events', 'sql' => "SELECT id, title, event_date, location, status, max_participants, current_participants, created_at FROM events ORDER BY created_at DESC LIMIT 100"),
        'announcements' => array('table' => 'announcements', 'sql' => "SELECT id, title, priority, published_at, expires_at, created_at FROM announcements ORDER BY created_at DESC LIMIT 100"),
        'resources' => array('table' => 'resources', 'sql' => "SELECT id, title, resource_type, category, url, downloads, created_at FROM resources ORDER BY created_at DESC LIMIT 100"),
        'gallery' => array('table' => 'gallery', 'sql' => "SELECT id, title, description, image_url, created_at FROM gallery ORDER BY created_at DESC LIMIT 100"),
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
