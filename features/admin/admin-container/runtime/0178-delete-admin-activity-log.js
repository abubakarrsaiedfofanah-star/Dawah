// Runtime slice from admin.js: deleteAdminActivityLog.
function deleteAdminActivityLog(logId) {
    if (!confirm('Delete this admin activity log? This only removes the record from the activity table.')) return;
    fetch(`${API_URL}?action=deleteAdminActivityLog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not delete activity log');
        showNotification('Activity log deleted', 'success');
        loadAdminActivityLogs();
        loadMyAdminActivityLogs();
    })
    .catch(error => showNotification(error.message || 'Could not delete activity log', 'danger'));
}
