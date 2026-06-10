// Runtime slice from daawah.js: isUniqueRegistrationRole.
function isUniqueRegistrationRole(role) {
    return !['student', 'admin'].includes(String(role || 'student').toLowerCase());
}
