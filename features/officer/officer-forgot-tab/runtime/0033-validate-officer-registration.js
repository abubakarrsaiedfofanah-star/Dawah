// Runtime slice from officer.js: validateOfficerRegistration.
function validateOfficerRegistration(data) {
    if (!OFFICER_ROLES.includes(data.role)) {
        return 'Please select a valid officer role.';
    }
    if (data.password !== data.confirmPassword) {
        return 'Passwords do not match.';
    }
    if (data.password.length < 10 || !/[a-z]/.test(data.password) || !/[A-Z]/.test(data.password)
        || !/[0-9]/.test(data.password) || !/[^A-Za-z0-9]/.test(data.password)) {
        return 'Use at least 10 characters with uppercase, lowercase, a number, and a symbol.';
    }
    if (!data.fullName || !data.student_id || !data.email || !data.phone || !data.school || !data.course || !data.year_of_study || !data.semester) {
        return 'Please fill in all required fields.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return 'Enter a valid email address.';
    }
    return '';
}
