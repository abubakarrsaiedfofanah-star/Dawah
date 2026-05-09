<?php
// Dawa'ah lightweight database migration helper.

require_once 'database.php';
require_once 'db_operations.php';

header('Content-Type: text/plain');

ensureStudentColumns();
ensureUserRoleColumn();

$profile_photo_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'profile_photos';
if (!is_dir($profile_photo_dir)) {
    mkdir($profile_photo_dir, 0755, true);
}

echo "Dawa'ah migrations complete.\n";
echo "- students.school checked\n";
echo "- students.semester checked\n";
echo "- students.passport_photo checked\n";
echo "- users.role checked\n";
echo "- uploads/profile_photos checked\n";
