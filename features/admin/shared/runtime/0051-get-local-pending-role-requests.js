// Runtime slice from admin.js: getLocalPendingRoleRequests.
function getLocalPendingRoleRequests() {
    return readStore('allMembers')
        .filter(member => isSpecialRole(member.role) && String(member.status || '').toLowerCase() !== 'active')
        .map(member => ({
            id: member.dbUserId || member.user_id || member.id || member.studentId || member.username,
            username: member.username || member.studentId || '',
            email: member.email || '',
            role: member.role || 'student',
            status: member.status || 'Pending',
            created_at: member.created_at || member.createdAt || '',
            first_name: member.fullName || member.name || '',
            last_name: '',
            student_id: member.studentId || member.username || '',
            phone: member.phone || '',
            course: member.course || '',
            year_of_study: member.yearOfStudy || ''
        }));
}
