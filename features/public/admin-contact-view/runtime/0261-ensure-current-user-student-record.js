// Runtime slice from daawah.js: ensureCurrentUserStudentRecord.
function ensureCurrentUserStudentRecord() {
    return fetch('supabase-required-endpoint?action=ensureStudentRecord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: currentUser?.username || currentUser?.studentId || currentUser?.email,
            student_id: currentUser?.studentId || currentUser?.username,
            email: currentUser?.email,
            password: currentUser?.password,
            role: currentUser?.role || currentRole || 'student',
            full_name: currentUser?.fullName || currentUser?.name || currentUser?.username,
            phone: currentUser?.phone,
            gender: currentUser?.gender,
            nationality: currentUser?.nationality,
            school: currentUser?.school,
            course: currentUser?.course,
            year_of_study: currentUser?.yearOfStudy,
            semester: currentUser?.semester,
            degree_type: 'degree',
            home_address: currentUser?.homeAddress,
            emergency_contact: currentUser?.emergencyContact,
            local_guardian: currentUser?.localGuardian
        })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success || !result.data?.student_id) {
            throw new Error(result.message || 'Could not create student record in the database.');
        }
        currentUser.dbStudentId = result.data.student_id;
        currentUser.dbUserId = result.data.user_id;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return result.data.student_id;
    });
}
