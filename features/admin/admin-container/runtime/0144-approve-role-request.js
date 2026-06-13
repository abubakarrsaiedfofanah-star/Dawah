// Runtime slice from admin.js: approveRoleRequest.
function approveRoleRequest(userId) {
    userId = decodeURIComponent(userId);
    adminApiRequest('approveRoleRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
    })
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not approve role request');
        showNotification('Role request approved.', 'success');
        loadPendingRoleRequests();
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not approve role request', 'danger'));
}
