// Runtime slice from admin.js: rejectLocalRoleRequest.
async function rejectLocalRoleRequest(userId) {
    const members = readStore('allMembers');
    const target = findLocalMemberByAdminId(members, userId);
    if (!target || !isSpecialRole(target.role)) {
        return { success: false, message: 'Role request not found.' };
    }
    const updatedTarget = { ...target, rejectedRole: target.role, role: 'student', status: 'Suspended', rejectedBy: currentAdmin?.email || currentAdmin?.username || 'Main Admin', rejectedAt: new Date().toISOString() };
    writeStore('allMembers', members.map(member => member === target ? updatedTarget : member));
    const cloudUserId = target.uid || target.authUid || target.id || target.supabaseId;
    if (window.SupabaseBackend?.enabled && cloudUserId) {
        if (target.supabaseId && window.SupabaseBackend.updateRecord) {
            await window.SupabaseBackend.updateRecord('members', target.supabaseId, updatedTarget);
        } else if (window.SupabaseBackend.updateMemberProfile) {
            await window.SupabaseBackend.updateMemberProfile(cloudUserId, updatedTarget);
        }
    }
    logLocalAdminActivity('rejectRoleRequest', { user_id: userId, role: target.role, username: target.username || target.studentId || '' });
    return { success: true, message: 'Role request rejected' };
}
