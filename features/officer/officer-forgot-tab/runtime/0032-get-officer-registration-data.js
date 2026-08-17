// Runtime slice from officer.js: getOfficerRegistrationData.
function getOfficerRegistrationData() {
    const fullName = document.getElementById('officerFullName').value.trim();
    const [firstName, ...lastNameParts] = fullName.split(/\s+/);
    return {
        fullName,
        first_name: firstName || fullName,
        last_name: lastNameParts.join(' ') || '-',
        student_id: document.getElementById('officerId').value.trim(),
        email: document.getElementById('officerEmail').value.trim().toLowerCase(),
        phone: document.getElementById('officerPhone').value.trim(),
        role: document.getElementById('officerRole').value,
        gender: document.getElementById('officerGender').value,
        school: document.getElementById('officerSchool').value,
        course: document.getElementById('officerCourse').value,
        year_of_study: document.getElementById('officerYear').value,
        semester: document.getElementById('officerSemester').value,
        password: document.getElementById('officerPassword').value,
        confirmPassword: document.getElementById('officerConfirmPassword').value,
        nationality: '',
        home_address: '',
        emergency_contact: '',
        emergency_contact_phone: '',
        local_guardian: '',
        local_guardian_phone: '',
        degree_type: 'degree'
    };
}
