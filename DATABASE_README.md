# Dawa'ah Database System Documentation

## Overview
The Dawa'ah database system is built on MySQL and includes comprehensive functionality for managing students, events, prayer times, welfare, donations, and more.

## Database Files

### 1. **database.php** - Main Database Configuration
Handles database connection and table creation.

**Tables Created:**
- `users` - User authentication and roles
- `students` - Student information and details
- `prayer_times` - Prayer times scheduling
- `events` - Event management
- `event_registrations` - Event attendance tracking
- `announcements` - System announcements
- `welfare_requests` - Student welfare requests
- `payments` - Payment and dues tracking
- `donations` - Donation management
- `leadership_roles` - Leadership positions
- `hadiths` - Hadith database
- `volunteer_opportunities` - Volunteer programs
- `volunteer_registrations` - Volunteer participation
- `resources` - Educational resources
- `islamic_calendar` - Islamic calendar events
- `messages` - Internal messaging
- `audit_log` - System audit trail

**Key Functions:**
```php
getDBConnection()           // Get database connection
executeQuery($sql)          // Execute SQL query
fetchAll($sql)              // Fetch all results
fetchOne($sql)              // Fetch single result
insertData($table, $data)   // Insert data
updateData($table, $data, $where) // Update data
deleteData($table, $where)  // Delete data
getDatabaseStatus()         // Get database info
```

### 2. **db_operations.php** - CRUD Operations
Contains all business logic functions for database operations.

**User Operations:**
```php
registerUser($username, $email, $password, $role)
loginUser($username, $password)
getUserById($user_id)
```

**Student Operations:**
```php
registerStudent($user_id, $data)
getStudentByUserId($user_id)
getAllStudents()
```

**Event Operations:**
```php
createEvent($data)
getUpcomingEvents($limit)
registerEventAttendee($event_id, $student_id)
```

**Prayer Times:**
```php
getPrayerTimes($date)
setPrayerTimes($date, $times)
```

**Welfare:**
```php
createWelfareRequest($student_id, $category, $description, $amount)
approveWelfareRequest($request_id, $approved_by, $notes)
getPendingWelfareRequests()
```

**Payments:**
```php
recordPayment($student_id, $payment_type, $amount, $due_date, $payment_method)
completePayment($payment_id, $transaction_id)
```

**Donations:**
```php
recordDonation($donor_id, $donor_name, $donor_email, $amount, $donation_type, $purpose)
getTotalDonations($year)
```

**Leadership:**
```php
assignLeadershipRole($student_id, $position, $department, $start_date)
getCurrentLeadership()
```

**Announcements:**
```php
createAnnouncement($title, $content, $author_id, $priority, $expires_at)
getActiveAnnouncements()
```

**Volunteer:**
```php
createVolunteerOpportunity($title, $description, $required_hours, $start_date, $end_date, $created_by)
registerVolunteer($opportunity_id, $student_id)
```

### 3. **api.php** - REST API Endpoints
Provides REST API for frontend communication with the database.

**User Endpoints:**
- `POST api.php?action=registerUser` - Register new user
- `POST api.php?action=loginUser` - Login user
- `GET api.php?action=getUser&id=1` - Get user info

**Student Endpoints:**
- `POST api.php?action=registerStudent` - Register student
- `GET api.php?action=getStudent&user_id=1` - Get student info
- `GET api.php?action=getAllStudents` - Get all students

**Event Endpoints:**
- `POST api.php?action=createEvent` - Create event
- `GET api.php?action=getUpcomingEvents&limit=10` - Get events
- `POST api.php?action=registerEvent` - Register for event

**Prayer Times:**
- `GET api.php?action=getPrayerTimes&date=2026-04-28` - Get prayer times
- `POST api.php?action=setPrayerTimes` - Set prayer times

**Welfare:**
- `POST api.php?action=createWelfareRequest` - Create request
- `GET api.php?action=getPendingWelfare` - Get pending requests
- `POST api.php?action=approveWelfare` - Approve request

**Payment:**
- `POST api.php?action=recordPayment` - Record payment
- `POST api.php?action=completePayment` - Complete payment

**Donation:**
- `POST api.php?action=recordDonation` - Record donation
- `GET api.php?action=getDonationStats&year=2026` - Get stats

**Leadership:**
- `POST api.php?action=assignLeadership` - Assign role
- `GET api.php?action=getLeadership` - Get current leadership

**Announcement:**
- `POST api.php?action=createAnnouncement` - Create announcement
- `GET api.php?action=getAnnouncements` - Get announcements

**Volunteer:**
- `POST api.php?action=createVolunteerOp` - Create opportunity
- `POST api.php?action=registerVolunteer` - Register volunteer

**System:**
- `GET api.php?action=dbStatus` - Get database status

### 4. **setup.php** - Sample Data Setup
Populates database with sample test data for development.

**Test Accounts:**
- Usernames are created by `setup.php` (`admin1`, `student1`, `student2`, `student3`, `finance`, `imam`)
- Passwords are generated each time setup runs and printed once in the setup output
- Optional environment variables: `DAWAAH_SETUP_PASSWORD`, `DAWAAH_SETUP_ADMIN_PASSWORD`, `DAWAAH_SETUP_STUDENT_PASSWORD`, `DAWAAH_SETUP_FINANCE_PASSWORD`, `DAWAAH_SETUP_IMAM_PASSWORD`

## Database Configuration

Set these environment variables in your hosting environment:
```php
DAWAAH_DB_HOST=localhost
DAWAAH_DB_USER=your_database_user
DAWAAH_DB_PASSWORD=your_database_password
DAWAAH_DB_NAME=dawaah_db
```
`DAWAAH_DB_USER` and `DAWAAH_DB_PASSWORD` are required.

## Installation Steps

1. **Create Database Connection:**
   - Open `database.php` in browser or run via PHP CLI
   - Tables will be created automatically

2. **Load Sample Data:**
   - Run `setup.php` to populate with test data
   - Creates test users, students, events, etc.

3. **Access API:**
   - Use `api.php` endpoints from JavaScript frontend
   - All responses in JSON format

## API Request Examples

### Register User
```javascript
fetch('api.php?action=registerUser', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        username: 'student1',
        email: 'student1@dawaah.edu',
        password: 'use-a-strong-password',
        role: 'student'
    })
})
```

### Login User
```javascript
fetch('api.php?action=loginUser', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        username: 'student1',
        password: 'use-a-strong-password'
    })
})
```

### Get Prayer Times
```javascript
fetch('api.php?action=getPrayerTimes&date=2026-04-28')
    .then(r => r.json())
    .then(data => console.log(data))
```

### Create Event
```javascript
fetch('api.php?action=createEvent', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        title: 'Quran Study Circle',
        description: 'Learn and discuss Quran',
        event_date: '2026-05-05 18:00:00',
        location: 'Main Hall',
        category: 'Religious',
        organizer_id: 1,
        max_participants: 30
    })
})
```

## Database Schema

### Users Table
```sql
id (INT, PRIMARY KEY)
username (VARCHAR, UNIQUE)
email (VARCHAR, UNIQUE)
password (VARCHAR, hashed)
role (ENUM: student, executive, imam, finance, admin)
status (ENUM: active, inactive, suspended)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
last_login (TIMESTAMP)
```

### Students Table
```sql
id (INT, PRIMARY KEY)
user_id (INT, FOREIGN KEY)
first_name, last_name
student_id (VARCHAR, UNIQUE)
phone, gender, nationality
course, year_of_study, degree_type
home_address, emergency_contact
local_guardian, passport_photo
membership_status
joined_date
```

### Events Table
```sql
id (INT, PRIMARY KEY)
title, description
event_date (DATETIME)
location, category
organizer_id (FOREIGN KEY)
status (ENUM: upcoming, ongoing, completed, cancelled)
max_participants, current_participants
poster_image
```

### Prayer Times Table
```sql
id (INT, PRIMARY KEY)
date (DATE, UNIQUE)
fajr, dhuhr, asr, maghrib, isha (TIME)
iqamah_fajr, iqamah_dhuhr, iqamah_asr, iqamah_maghrib, iqamah_isha
jummah_time
```

## Security Features

- **Password Hashing:** Uses `PASSWORD_BCRYPT`
- **Prepared Statements:** Prevents SQL injection
- **Audit Logging:** Tracks all changes
- **Role-Based Access:** Different permissions per role
- **Status Tracking:** Active/inactive user management

## Performance Considerations

- Indexes on frequently queried fields
- Prepared statements for efficiency
- Connection pooling available
- Optimized JOIN queries

## Troubleshooting

**Connection Error:**
- Check `DAWAAH_DB_HOST`, `DAWAAH_DB_USER`, and `DAWAAH_DB_PASSWORD` in your environment
- Ensure MySQL/MariaDB is running

**Table Creation Failed:**
- Check database permissions
- Verify sufficient storage space

**API Returns Empty:**
- Verify sample data was loaded via setup.php
- Check user authentication status

**Query Slow:**
- Add indexes to frequently searched columns
- Use LIMIT for large result sets

## Future Enhancements

- [ ] Database replication
- [ ] Caching layer (Redis)
- [ ] Advanced reporting
- [ ] Data export functionality
- [ ] Backup automation
- [ ] Analytics dashboard

## Support

For issues or questions about the database system, contact the Dawa'ah technical team.
