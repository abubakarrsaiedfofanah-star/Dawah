// Runtime slice from daawah.js: applyStudentBulkAction.
function applyStudentBulkAction() {
    const action = document.getElementById('studentBulkAction')?.value || '';
    const ids = getSelectedStudentIds();
    if (!action) {
        showNotification('Choose a bulk action first.', 'warning');
        return;
    }
    if (!ids.length) {
        showNotification('Select at least one student first.', 'warning');
        return;
    }
    if (action === 'export') {
        exportSelectedStudents(ids);
        return;
    }
    if (!confirmDangerAction(`Apply ${action} to ${ids.length} selected student(s)?`, 'CONFIRM')) return;
    ids.forEach(id => setMemberStatus(id, action, { silent: true }));
    loadMemberDatabase();
    showNotification(`Bulk action applied to ${ids.length} student(s).`, 'success');
}
