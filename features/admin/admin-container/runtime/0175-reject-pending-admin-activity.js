// Runtime slice from admin.js: rejectPendingAdminActivity.
function rejectPendingAdminActivity(logId) {
    const reason = prompt('Reason for rejecting this pending action?');
    if (reason === null) return;
    fetch(`${API_URL}?action=rejectPendingAdminActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reject action');
        showNotification('Pending action rejected', 'success');
        loadAdminActivityLogs();
    })
    .catch(error => showNotification(error.message || 'Could not reject action', 'danger'));
}
