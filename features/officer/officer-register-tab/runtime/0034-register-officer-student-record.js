// Runtime slice from officer.js: registerOfficerStudentRecord.
function registerOfficerStudentRecord(userId, data) {
    const formData = new FormData();
    Object.entries({
        user_id: userId,
        first_name: data.first_name,
        last_name: data.last_name,
        student_id: data.student_id,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        nationality: data.nationality,
        school: data.school,
        course: data.course,
        year_of_study: data.year_of_study,
        semester: data.semester,
        degree_type: data.degree_type,
        home_address: data.home_address,
        emergency_contact: data.emergency_contact,
        emergency_contact_phone: data.emergency_contact_phone,
        local_guardian: data.local_guardian,
        local_guardian_phone: data.local_guardian_phone
    }).forEach(([key, value]) => formData.append(key, value));

    return fetch('supabase-required-endpoint?action=registerStudent', {
        method: 'POST',
        body: formData
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Officer profile could not be saved');
        }
        return result;
    });
}
