// Runtime slice from admin.js: approveLocalRoleRequest.
async function approveLocalRoleRequest(userId) {
    const members = readStore('allMembers');
    const target = members.find(member => String(member.dbUserId || member.user_id || member.id || member.studentId || member.username) === String(userId));
    if (!target || !isSpecialRole(target.role)) {
        return { success: false, message: 'Role request not found.' };
    }
    const activeHolder = members.find(member =>
        member !== target &&
        String(member.role || '').toLowerCase() === String(target.role || '').toLowerCase() &&
        String(member.status || '').toLowerCase() === 'active'
    );
    if (activeHolder) {
        return { success: false, message: `${target.role} role is already active. Remove or deactivate the existing holder first.` };
    }
    const updatedTarget = { ...target, status: 'Active', approvedBy: currentAdmin?.email || currentAdmin?.username || 'Main Admin', approvedAt: new Date().toISOString() };
    writeStore('allMembers', members.map(member => member === target ? updatedTarget : member));
    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.updateMemberProfile && (target.uid || target.id)) {
        await window.SupabaseBackend.updateMemberProfile(target.uid || target.id, updatedTarget);
    }
    logLocalAdminActivity('approveRoleRequest', { user_id: userId, role: target.role, username: target.username || target.studentId || '' });
    return { success: true, message: 'Role request approved' };
}
