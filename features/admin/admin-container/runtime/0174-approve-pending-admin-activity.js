// Runtime slice from admin.js: approvePendingAdminActivity.
function approvePendingAdminActivity(logId) {
    if (!confirm('Approve and apply this pending sub-admin action?')) return;
    fetch(`${API_URL}?action=approvePendingAdminActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not approve action');
        showNotification('Pending action approved and applied', 'success');
        loadAdminActivityLogs();
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not approve action', 'danger'));
}
