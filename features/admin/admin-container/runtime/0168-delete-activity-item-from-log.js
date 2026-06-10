// Runtime slice from admin.js: deleteActivityItemFromLog.
function deleteActivityItemFromLog(logId) {
    const reason = prompt('Reason for deleting/opposing this admin action?');
    if (reason === null) return;
    fetch(`${API_URL}?action=deleteAdminActivityItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not delete item');
        showNotification('Item deleted and action recorded', 'success');
        loadAdminActivityLogs();
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not delete item', 'danger'));
}
