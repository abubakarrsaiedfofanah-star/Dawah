// Runtime slice from admin.js: getLocalPendingRoleRequests.
function getLocalMemberAdminId(member = {}) {
    return member.dbUserId || member.user_id || member.uid || member.authUid || member.id || member.supabaseId || member.studentId || member.username || member.email || '';
}

function localMemberMatchesAdminId(member = {}, userId = '') {
    const lookup = String(userId || '').trim().toLowerCase();
    if (!lookup) return false;
    return [
        member.dbUserId,
        member.user_id,
        member.uid,
        member.authUid,
        member.id,
        member.supabaseId,
        member.studentId,
        member.username,
        member.email,
        member.authEmail
    ].some(value => String(value || '').trim().toLowerCase() === lookup);
}

function findLocalMemberByAdminId(members = [], userId = '') {
    return members.find(member => localMemberMatchesAdminId(member, userId));
}

function getLocalPendingRoleRequests() {
    return readStore('allMembers')
        .filter(member => {
            const status = String(member.status || member.accountStatus || '').toLowerCase();
            return isSpecialRole(member.role) && !['active', 'approved', 'rejected', 'suspended'].includes(status);
        })
        .map(member => ({
            id: getLocalMemberAdminId(member),
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
