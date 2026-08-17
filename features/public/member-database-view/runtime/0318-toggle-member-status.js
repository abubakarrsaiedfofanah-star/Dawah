// Runtime slice from daawah.js: toggleMemberStatus.
function toggleMemberStatus(studentId) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    const nextStatus = String(member?.status || 'Pending').toLowerCase() === 'active' ? 'Inactive' : 'Active';
    setMemberStatus(studentId, nextStatus);
}
