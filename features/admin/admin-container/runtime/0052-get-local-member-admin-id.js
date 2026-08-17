// Runtime slice from admin.js: getLocalMemberAdminId.
function getLocalMemberAdminId(member = {}) {
    return member.dbUserId || member.user_id || member.uid || member.authUid || member.id || member.supabaseId || member.studentId || member.username || member.email || '';
}
