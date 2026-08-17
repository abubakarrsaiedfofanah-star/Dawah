// Runtime slice from admin.js: undoMyAdminActivity.
function undoMyAdminActivity(logId) {
    const reason = prompt('Reason for undoing this action?');
    if (reason === null) return;
    fetch(`${API_URL}?action=undoMyAdminActivityItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not undo action');
        showNotification('Your action was undone', 'success');
        loadMyAdminActivityLogs();
        if (currentAdmin?.isMainAdmin) {
            loadAdminActivityLogs();
        }
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not undo action', 'danger'));
}
