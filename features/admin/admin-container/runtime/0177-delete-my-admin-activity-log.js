// Runtime slice from admin.js: deleteMyAdminActivityLog.
function deleteMyAdminActivityLog(logId) {
    if (!confirm('Delete this recent action from your list? This only removes the log entry.')) return;
    fetch(`${API_URL}?action=deleteMyAdminActivityLog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not delete activity log');
        showNotification('Activity log deleted', 'success');
        loadMyAdminActivityLogs();
        if (currentAdmin?.isMainAdmin) {
            loadAdminActivityLogs();
        }
    })
    .catch(error => showNotification(error.message || 'Could not delete activity log', 'danger'));
}
