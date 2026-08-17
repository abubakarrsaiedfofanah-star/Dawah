// Runtime slice from daawah.js: exportSelectedStudents.
function exportSelectedStudents(ids) {
    const selected = allMembers.filter(member => ids.includes(member.studentId || member.username));
    if (!selected.length) {
        showNotification('No selected students to export.', 'warning');
        return;
    }
    const csv = convertToCSV(selected.map(member => ({
        fullName: member.fullName || member.name || '',
        studentId: member.studentId || member.username || '',
        email: member.email || '',
        phone: member.phone || '',
        course: member.course || '',
        status: member.status || '',
        membershipStatus: member.membershipStatus || '',
        paymentStatus: member.membershipCardPaymentStatus || member.paymentStatus || 'No payment'
    })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
