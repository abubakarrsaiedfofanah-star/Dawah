// Runtime slice from daawah.js: saveProfileToDatabase.
function saveProfileToDatabase(profile) {
    const [firstName, ...lastParts] = profile.fullName.split(/\s+/);
    return getCurrentStudentId()
        .then(studentDbId => {
            const profileData = new FormData();
            Object.entries({
                student_db_id: studentDbId,
                first_name: firstName || profile.fullName,
                last_name: lastParts.join(' ') || '-',
                student_id: profile.studentId,
                email: profile.email,
                phone: profile.phone,
                degree_type: 'degree',
                school: profile.school,
                course: profile.course,
                year_of_study: profile.yearOfStudy,
                semester: profile.semester,
                gender: profile.gender,
                nationality: profile.nationality,
                emergency_contact: profile.emergencyContact,
                local_guardian: profile.localGuardian,
                home_address: profile.homeAddress,
                remove_photo: profile.removePhoto ? '1' : ''
            }).forEach(([key, value]) => profileData.append(key, value || ''));
            if (profile.passportPhotoFile) {
                profileData.append('passport_photo_file', profile.passportPhotoFile);
            }

            return fetch('firestore-disabled-endpoint?action=updateStudentProfile', {
                method: 'POST',
                body: profileData
            });
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not update profile');
            }
            return result.data || {};
        });
}
