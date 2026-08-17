// Runtime slice from officer.js: hydrateOfficerDashboardUser.
function hydrateOfficerDashboardUser(identifier, serverUser) {
    return fetch(`supabase-required-endpoint?action=getStudentByIdentifier&identifier=${encodeURIComponent(identifier)}`, {
        credentials: 'same-origin'
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        const student = result.success ? result.data : {};
        return {
            dbUserId: serverUser.id || student.user_id,
            dbStudentId: student.id,
            username: serverUser.username || identifier,
            email: serverUser.email || student.email,
            role: serverUser.role,
            status: serverUser.status,
            csrf_token: serverUser.csrf_token || '',
            fullName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || serverUser.username,
            studentId: student.student_id || serverUser.username,
            phone: student.phone || '',
            gender: student.gender || '',
            school: student.school || '',
            course: student.course || '',
            yearOfStudy: student.year_of_study || '',
            semester: student.semester || '',
            passport_photo: student.passport_photo || ''
        };
    });
}
