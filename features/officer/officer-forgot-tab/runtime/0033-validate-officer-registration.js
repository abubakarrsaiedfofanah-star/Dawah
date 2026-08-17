// Runtime slice from officer.js: validateOfficerRegistration.
function validateOfficerRegistration(data) {
    if (!OFFICER_ROLES.includes(data.role)) {
        return 'Please select a valid officer role.';
    }
    if (data.password !== data.confirmPassword) {
        return 'Passwords do not match.';
    }
    if (data.password.length < 6) {
        return 'Password must be at least 6 characters.';
    }
    if (!data.fullName || !data.student_id || !data.email || !data.phone || !data.school || !data.course || !data.year_of_study || !data.semester) {
        return 'Please fill in all required fields.';
    }
    return '';
}
