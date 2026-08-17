// Runtime slice from admin.js: localMemberMatchesAdminId.
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
