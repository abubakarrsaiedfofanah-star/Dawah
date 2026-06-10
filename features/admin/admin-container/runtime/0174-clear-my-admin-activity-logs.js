// Runtime slice from admin.js: clearMyAdminActivityLogs.
function clearMyAdminActivityLogs() {
    if (!confirm('Clear all your recent action records?')) return;
    adminApiRequest('clearMyAdminActivityLogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not clear recent actions');
        showNotification('Your recent actions were cleared', 'success');
        loadMyAdminActivityLogs();
        if (currentAdmin?.isMainAdmin) {
            loadAdminActivityLogs();
        }
    })
    .catch(error => showNotification(error.message || 'Could not clear recent actions', 'danger'));
}
