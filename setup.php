<?php
// COMMUJ Sample Data Setup Script

require_once 'database.php';
require_once 'db_operations.php';

// Sample data setup - Call this to populate database with test data

function setupSampleData() {
    echo "Starting sample data setup...\n\n";

    $defaultPassword = getenv('COMMUJ_SETUP_PASSWORD') ?: bin2hex(random_bytes(8));
    $adminPassword = getenv('COMMUJ_SETUP_ADMIN_PASSWORD') ?: $defaultPassword;
    $studentPassword = getenv('COMMUJ_SETUP_STUDENT_PASSWORD') ?: $defaultPassword;
    $financePassword = getenv('COMMUJ_SETUP_FINANCE_PASSWORD') ?: $defaultPassword;
    $imamPassword = getenv('COMMUJ_SETUP_IMAM_PASSWORD') ?: $defaultPassword;
    
    // ============================================
    // CREATE SAMPLE USERS
    // ============================================
    echo "Creating sample users...\n";
    
    $users = [
        ['username' => 'admin1', 'email' => 'admin@commuj.edu', 'password' => $adminPassword, 'role' => 'admin'],
        ['username' => 'student1', 'email' => 'student1@commuj.edu', 'password' => $studentPassword, 'role' => 'student'],
        ['username' => 'student2', 'email' => 'student2@commuj.edu', 'password' => $studentPassword, 'role' => 'student'],
        ['username' => 'student3', 'email' => 'student3@commuj.edu', 'password' => $studentPassword, 'role' => 'student'],
        ['username' => 'finance', 'email' => 'finance@commuj.edu', 'password' => $financePassword, 'role' => 'finance'],
        ['username' => 'imam', 'email' => 'imam@commuj.edu', 'password' => $imamPassword, 'role' => 'imam'],
    ];
    
    $user_ids = [];
    foreach ($users as $user) {
        $result = registerUser($user['username'], $user['email'], $user['password'], $user['role']);
        if ($result['success']) {
            $user_ids[$user['username']] = $result['user_id'];
            echo "✓ Created user: {$user['username']}\n";
        }
    }
    
    echo "\n";
    
    // ============================================
    // CREATE SAMPLE STUDENTS
    // ============================================
    echo "Creating sample students...\n";
    
    $students_data = [
        [
            'user_id' => $user_ids['student1'],
            'first_name' => 'Ahmed',
            'last_name' => 'Hassan',
            'student_id' => 'STU001',
            'email' => 'student1@commuj.edu',
            'phone' => '0123456789',
            'gender' => 'male',
            'nationality' => 'Sudanese',
            'course' => 'medicine',
            'year_of_study' => '2',
            'degree_type' => 'degree',
            'home_address' => '123 Main Street',
            'emergency_contact' => 'Muhammad Hassan',
            'emergency_contact_phone' => '0987654321',
            'local_guardian' => 'Dr. Ibrahim Ali',
            'local_guardian_phone' => '0111222333'
        ],
        [
            'user_id' => $user_ids['student2'],
            'first_name' => 'Fatima',
            'last_name' => 'Mohamed',
            'student_id' => 'STU002',
            'email' => 'student2@commuj.edu',
            'phone' => '0198765432',
            'gender' => 'female',
            'nationality' => 'Egyptian',
            'course' => 'nursing',
            'year_of_study' => '1',
            'degree_type' => 'diploma',
            'home_address' => '456 School Ave',
            'emergency_contact' => 'Aisha Mohamed',
            'emergency_contact_phone' => '0987123456',
            'local_guardian' => 'Mrs. Layla Ahmed',
            'local_guardian_phone' => '0111333444'
        ],
        [
            'user_id' => $user_ids['student3'],
            'first_name' => 'Omar',
            'last_name' => 'Khan',
            'student_id' => 'STU003',
            'email' => 'student3@commuj.edu',
            'phone' => '0155555555',
            'gender' => 'male',
            'nationality' => 'Pakistani',
            'course' => 'pharmacy',
            'year_of_study' => '3',
            'degree_type' => 'degree',
            'home_address' => '789 Hospital Road',
            'emergency_contact' => 'Khalid Khan',
            'emergency_contact_phone' => '0987654098',
            'local_guardian' => 'Prof. Mustafa Khan',
            'local_guardian_phone' => '0111444555'
        ]
    ];
    
    foreach ($students_data as $student) {
        $result = registerStudent($student['user_id'], $student);
        if ($result['success']) {
            echo "✓ Created student: {$student['first_name']} {$student['last_name']}\n";
        }
    }
    
    echo "\n";
    
    // ============================================
    // CREATE SAMPLE EVENTS
    // ============================================
    echo "Creating sample events...\n";
    
    $events = [
        [
            'title' => 'Quranic Recitation Competition',
            'description' => 'Annual Quranic recitation competition for all students',
            'event_date' => date('Y-m-d H:i:s', strtotime('+7 days')),
            'location' => 'Main Hall',
            'category' => 'Religious',
            'organizer_id' => $user_ids['admin1'],
            'status' => 'upcoming',
            'max_participants' => 50
        ],
        [
            'title' => 'Islamic Awareness Seminar',
            'description' => 'Learn about Islamic ethics and values',
            'event_date' => date('Y-m-d H:i:s', strtotime('+14 days')),
            'location' => 'Lecture Hall A',
            'category' => 'Educational',
            'organizer_id' => $user_ids['imam'],
            'status' => 'upcoming',
            'max_participants' => 100
        ],
        [
            'title' => 'Sports Day',
            'description' => 'Inter-class sports competition',
            'event_date' => date('Y-m-d H:i:s', strtotime('+21 days')),
            'location' => 'Sports Ground',
            'category' => 'Sports',
            'organizer_id' => $user_ids['admin1'],
            'status' => 'upcoming',
            'max_participants' => 200
        ]
    ];
    
    foreach ($events as $event) {
        $result = createEvent($event);
        if ($result['success']) {
            echo "✓ Created event: {$event['title']}\n";
        }
    }
    
    echo "\n";
    
    // ============================================
    // SET PRAYER TIMES
    // ============================================
    echo "Creating prayer times...\n";
    
    $prayer_times = [
        'fajr' => '05:30',
        'dhuhr' => '12:30',
        'asr' => '15:45',
        'maghrib' => '18:15',
        'isha' => '19:45',
        'iqamah_fajr' => '05:45',
        'iqamah_dhuhr' => '12:45',
        'iqamah_asr' => '16:00',
        'iqamah_maghrib' => '18:30',
        'iqamah_isha' => '20:00',
        'jummah_time' => '12:30'
    ];
    
    $result = setPrayerTimes(date('Y-m-d'), $prayer_times);
    if ($result['success']) {
        echo "✓ Prayer times set for today\n";
    }
    
    echo "\n";
    
    // ============================================
    // CREATE SAMPLE ANNOUNCEMENTS
    // ============================================
    echo "Creating announcements...\n";
    
    $announcements = [
        [
            'title' => 'Welcome to COMMUJ!',
            'content' => 'Welcome to College of Medicine Muslim Jamaat. We are excited to have you as part of our community.',
            'author_id' => $user_ids['admin1'],
            'priority' => 'high',
            'expires_at' => date('Y-m-d', strtotime('+30 days'))
        ],
        [
            'title' => 'Jumu\'ah Reminder',
            'content' => 'Tomorrow is Friday. Join us at the main prayer hall at 12:30 PM for Jumu\'ah prayer.',
            'author_id' => $user_ids['imam'],
            'priority' => 'high',
            'expires_at' => date('Y-m-d', strtotime('+1 day'))
        ],
        [
            'title' => 'Membership Dues Due',
            'content' => 'Membership dues for this semester are now due. Please visit the finance office to make payment.',
            'author_id' => $user_ids['finance'],
            'priority' => 'medium',
            'expires_at' => date('Y-m-d', strtotime('+7 days'))
        ]
    ];
    
    foreach ($announcements as $ann) {
        $result = createAnnouncement($ann['title'], $ann['content'], $ann['author_id'], $ann['priority'], $ann['expires_at']);
        if ($result['success']) {
            echo "✓ Created announcement: {$ann['title']}\n";
        }
    }
    
    echo "\n";
    
    // ============================================
    // CREATE SAMPLE LEADERSHIP ROLES
    // ============================================
    echo "Creating leadership roles...\n";
    
    $leadership_roles = [
        ['student_id' => 1, 'position' => 'President', 'department' => 'Executive Board', 'start_date' => date('Y-m-d')],
        ['student_id' => 2, 'position' => 'Vice President', 'department' => 'Executive Board', 'start_date' => date('Y-m-d')],
        ['student_id' => 3, 'position' => 'Secretary', 'department' => 'Executive Board', 'start_date' => date('Y-m-d')],
    ];
    
    foreach ($leadership_roles as $role) {
        $result = assignLeadershipRole($role['student_id'], $role['position'], $role['department'], $role['start_date']);
        if ($result['success']) {
            echo "✓ Assigned role: {$role['position']}\n";
        }
    }
    
    echo "\n";
    
    // ============================================
    // CREATE SAMPLE HADITH DATA
    // ============================================
    echo "Creating sample Hadiths in database...\n";
    
    $hadiths = [
        [
            'arabic_text' => 'عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: "من قام ليلة القدر إيماناً واحتساباً غفر له ما تقدم من ذنبه"',
            'english_translation' => 'Whoever stands in prayer during the Night of Power with faith and hoping for its reward, will have all previous sins forgiven.',
            'reference' => 'Sahih Bukhari 1901 & Muslim 760',
            'source' => 'Abu Hurairah',
            'category' => 'Ramadan'
        ],
        [
            'arabic_text' => 'قال رسول الله صلى الله عليه وسلم: "خير الناس أنفعهم للناس"',
            'english_translation' => 'The best of people are those who are most beneficial to others.',
            'reference' => 'Sunan Ibn Majah 4106',
            'source' => 'Prophet Muhammad',
            'category' => 'Character'
        ]
    ];
    
    $conn = getDBConnection();
    foreach ($hadiths as $hadith) {
        $sql = "INSERT INTO hadiths (arabic_text, english_translation, reference, source, category) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssss", $hadith['arabic_text'], $hadith['english_translation'], 
                         $hadith['reference'], $hadith['source'], $hadith['category']);
        if ($stmt->execute()) {
            echo "✓ Added Hadith\n";
        }
    }
    
    echo "\n";
    echo "================================\n";
    echo "✓ Sample data setup complete!\n";
    echo "================================\n";
    echo "\nTest Credentials:\n";
    echo "Admin - Username: admin1, Password: {$adminPassword}\n";
    echo "Student - Username: student1, Password: {$studentPassword}\n";
    echo "Finance - Username: finance, Password: {$financePassword}\n";
    echo "Imam - Username: imam, Password: {$imamPassword}\n";
}

// Run setup if called directly
if (basename($_SERVER['PHP_SELF']) === 'setup.php') {
    setupSampleData();
} else {
    // Make it available as a function
    return;
}

?>
