// Runtime slice from daawah.js: setMemberStatus.
function setMemberStatus(studentId, nextStatus, options = {}) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    if (!member) {
        showNotification('Member record not found.', 'warning');
        return;
    }
    if (String(nextStatus || '').toLowerCase() === 'active' && isUniqueRegistrationRole(member.role)) {
        showNotification('Special roles must be approved by the main admin from the admin panel Role Requests.', 'warning');
        return;
    }

    allMembers = allMembers.map(item =>
        item.studentId === studentId || item.username === studentId ? { ...item, status: nextStatus } : item
    );
    localStorage.setItem('allMembers', JSON.stringify(allMembers));
    logLocalRoleActivity('updateStudentStatus', { student_id: studentId, status: nextStatus });
    if (currentUser && (currentUser.studentId === studentId || currentUser.username === studentId)) {
        currentUser.status = nextStatus;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    if (!options.silent) loadMemberDatabase();
    syncMemberStatusToDatabase(member, nextStatus);
    if (String(nextStatus || '').toLowerCase() === 'active' && window.DawaahCloud?.enabled) {
        window.DawaahCloud.saveMemberVerification?.({ ...member, status: nextStatus }).catch(error => {
            console.error('Member verification sync failed:', error);
        });
    }
    addStudentLocalNotification(member, 'Account status updated', `Your account status is now ${nextStatus}.`, String(nextStatus).toLowerCase() === 'active' ? 'success' : 'warning');
    if (!options.silent) showNotification(`Member ${nextStatus.toLowerCase()}.`, 'success');
}
