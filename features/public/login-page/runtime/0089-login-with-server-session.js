// Runtime slice from daawah.js: loginWithServerSession.
function loginWithServerSession(username, password) {
    fetch('supabase-required-endpoint?action=loginUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success || !result.data) {
            throw new Error(result.message || 'Invalid username or password.');
        }

        const serverUser = result.data;

        return fetch(`supabase-required-endpoint?action=getStudentByIdentifier&identifier=${encodeURIComponent(username)}`, {
            credentials: 'same-origin'
        })
        .then(response => parseJsonResponse(response))
        .then(studentResult => {
            const student = studentResult.success ? studentResult.data : {};
            const localUser = getRegisteredUser(username) || {};
            return {
                ...localUser,
                ...student,
                dbUserId: serverUser.id || student.user_id || localUser.dbUserId,
                dbStudentId: student.id || localUser.dbStudentId,
                username: serverUser.username || localUser.username || username,
                email: serverUser.email || student.email || localUser.email,
                role: serverUser.role,
                status: serverUser.status,
                fullName: localUser.fullName || `${student.first_name || ''} ${student.last_name || ''}`.trim() || serverUser.username,
                studentId: student.student_id || localUser.studentId || serverUser.username,
                school: student.school || localUser.school,
                course: student.course || localUser.course,
                yearOfStudy: student.year_of_study || localUser.yearOfStudy,
                semester: student.semester || localUser.semester,
                passport_photo: student.passport_photo || localUser.passport_photo,
                passportPhotoData: localUser.passportPhotoData || ''
            };
        });
    })
    .then(user => {
        loginFailedAttempts = 0;
        loginLockedUntil = 0;
        currentUser = user;
        currentRole = user.role;
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentRole', user.role);
        document.getElementById('loginForm').reset();
        showDashboard();
        checkForAppUpdate(true);
    })
    .catch(error => {
        recordFailedLoginAttempt(error.message || 'Login failed.');
    });
}
