// Runtime slice from admin.js: getLocalRoleAssignableMembers.
function getLocalRoleAssignableMembers() {
    return readStore('allMembers').map(member => ({
        id: member.dbUserId || member.user_id || member.id || member.studentId || member.username,
        username: member.username || member.studentId || '',
        email: member.email || '',
        role: member.role || 'student',
        status: member.status || 'Active',
        first_name: member.fullName || member.name || '',
        last_name: '',
        student_id: member.studentId || member.username || '',
        phone: member.phone || '',
        course: member.course || '',
        year_of_study: member.yearOfStudy || ''
    }));
}
