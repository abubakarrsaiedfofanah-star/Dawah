// Runtime slice from admin.js: isStudentRecord.
function isStudentRecord(member) {
    const role = normalizeAdminText(member?.role || 'student');
    return !role || role === 'student' || role.includes('student');
}
