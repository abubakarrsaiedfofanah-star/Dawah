// Runtime slice from admin.js: isSpecialRole.
function isSpecialRole(role) {
    return !['student', 'admin'].includes(String(role || 'student').toLowerCase());
}
