// Runtime slice from admin.js: clearAllAdminActivityLogs.
function clearAllAdminActivityLogs() {
    if (!isBackupCurrentEnoughForDanger()) return;
    if (!confirm('Clear all admin activity records? This removes the activity history list.')) return;
    adminApiRequest('clearAdminActivityLogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not clear admin activity');
        showNotification('Admin activity cleared', 'success');
        loadAdminActivityLogs();
        loadMyAdminActivityLogs();
    })
    .catch(error => showNotification(error.message || 'Could not clear admin activity', 'danger'));
}
