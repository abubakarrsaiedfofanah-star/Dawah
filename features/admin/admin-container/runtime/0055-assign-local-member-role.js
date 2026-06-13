// Runtime slice from admin.js: assignLocalMemberRole.
async function assignLocalMemberRole(request) {
    const userId = request.user_id;
    const role = String(request.role || 'student').toLowerCase();
    const status = String(request.status || 'active').toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
    const members = readStore('allMembers');
    const target = members.find(member => String(member.dbUserId || member.user_id || member.id || member.studentId || member.username) === String(userId));
    if (!target) {
        return { success: false, message: 'Member not found.' };
    }
    if (isSpecialRole(role) && status.toLowerCase() === 'active') {
        const activeHolder = members.find(member =>
            member !== target &&
            String(member.role || '').toLowerCase() === role &&
            String(member.status || '').toLowerCase() === 'active'
        );
        if (activeHolder) {
            return { success: false, message: `${role} role is already active. Remove or deactivate the existing holder first.` };
        }
    }
    const updatedTarget = { ...target, role, status, roleAssignedBy: currentAdmin?.email || currentAdmin?.username || 'Main Admin', roleAssignedAt: new Date().toISOString() };
    writeStore('allMembers', members.map(member =>
        member === target ? updatedTarget : member
    ));
    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.updateMemberProfile && (target.uid || target.id)) {
        await window.SupabaseBackend.updateMemberProfile(target.uid || target.id, updatedTarget);
    }
    logLocalAdminActivity('assignMemberRole', { user_id: userId, role, status, username: target.username || target.studentId || '' });
    return { success: true, message: 'Member role updated' };
}
