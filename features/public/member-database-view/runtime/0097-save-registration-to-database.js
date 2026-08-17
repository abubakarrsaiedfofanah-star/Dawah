// Runtime slice from daawah.js: saveRegistrationToDatabase.
function saveRegistrationToDatabase(newUser, fullName, password) {
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ') || '-';

    return fetch('supabase-required-endpoint?action=registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: newUser.studentId,
            email: newUser.email,
            role: newUser.role
        })
    })
    .then(response => parseJsonResponse(response))
    .then(userResult => {
        if (!userResult.success) {
            throw new Error(userResult.message || 'Could not create user in database');
        }
        const userId = userResult.data.user_id;
        const studentData = new FormData();
        Object.entries({
            user_id: userId,
            first_name: firstName || fullName,
            last_name: lastName,
            student_id: newUser.studentId,
            email: newUser.email,
            phone: newUser.phone,
            gender: newUser.gender,
            nationality: newUser.nationality,
            school: newUser.school,
            course: newUser.course,
            year_of_study: newUser.yearOfStudy,
            semester: newUser.semester,
            degree_type: 'degree',
            passport_photo: newUser.passportPhoto,
            home_address: newUser.homeAddress,
            emergency_contact: newUser.emergencyContact,
            emergency_contact_phone: '',
            local_guardian: newUser.localGuardian,
            local_guardian_phone: ''
        }).forEach(([key, value]) => studentData.append(key, value || ''));
        if (newUser.passportPhotoFile) {
            studentData.append('passport_photo_file', newUser.passportPhotoFile);
        }

        return fetch('supabase-required-endpoint?action=registerStudent', {
            method: 'POST',
            body: studentData
        })
        .then(response => parseJsonResponse(response))
        .then(studentResult => {
            if (!studentResult.success) {
                throw new Error(studentResult.message || 'Could not create student record in database');
            }
            const uploadedPath = studentResult.data.passport_photo || '';
            return {
                ...newUser,
                dbUserId: userId,
                dbStudentId: studentResult.data.student_id,
                status: (newUser.role || 'student') === 'student' ? 'Active' : 'Pending',
                password: '',
                passportPhotoData: uploadedPath ? '' : newUser.passportPhotoData,
                passport_photo: uploadedPath || newUser.passport_photo || ''
            };
        });
    });
}
