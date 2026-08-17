// Runtime slice from admin.js: opposeAdminActivity.
function opposeAdminActivity(logId) {
    const reason = prompt('Reason for opposing this admin action?');
    if (reason === null) return;
    fetch(`${API_URL}?action=opposeAdminActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not record opposition');
        showNotification('Opposition recorded', 'success');
        loadAdminActivityLogs();
    })
    .catch(error => showNotification(error.message || 'Could not record opposition', 'danger'));
}
