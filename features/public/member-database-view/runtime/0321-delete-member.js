// Runtime slice from daawah.js: deleteMember.
async function deleteMember(studentId) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    if (!member) {
        showNotification('Member record not found.', 'warning');
        return;
    }
    if (!confirmDangerAction(`Permanently delete ${member.fullName || member.username || 'this student'} and their student record? This action cannot be undone.`, 'DELETE')) {
        return;
    }

    try {
        await syncMemberDeleteToDatabase(member);
        allMembers = allMembers.filter(item => item !== member);
        localStorage.setItem('allMembers', JSON.stringify(allMembers));
        if (currentUser && (currentUser.studentId === studentId || currentUser.username === studentId)) {
            currentUser = null;
            localStorage.removeItem('currentUser');
        }
        renderMemberDatabase();
        showNotification('Student deleted.', 'success');
    } catch (error) {
        console.error('Student deletion failed:', error);
        showNotification(error.message || 'The student could not be deleted. Please try again.', 'danger');
    }
}
