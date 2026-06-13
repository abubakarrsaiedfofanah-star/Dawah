// Runtime slice from daawah.js: deleteMember.
function deleteMember(studentId) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    if (!member) {
        showNotification('Member record not found.', 'warning');
        return;
    }
    if (!confirmDangerAction(`Delete ${member.fullName || member.username || 'this member'}? This removes the local member record.`, 'DELETE')) {
        return;
    }

    allMembers = allMembers.filter(item => item.studentId !== studentId && item.username !== studentId);
    localStorage.setItem('allMembers', JSON.stringify(allMembers));
    if (currentUser && (currentUser.studentId === studentId || currentUser.username === studentId)) {
        currentUser = null;
        localStorage.removeItem('currentUser');
    }
    loadMemberDatabase();
    syncMemberDeleteToDatabase(member);
    showNotification('Member deleted.', 'success');
}
