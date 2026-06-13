// Runtime slice from admin.js: rejectRoleRequest.
function rejectRoleRequest(userId) {
    userId = decodeURIComponent(userId);
    if (!confirm('Reject this role request? The role will become available for another member.')) return;
    adminApiRequest('rejectRoleRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
    })
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reject role request');
        showNotification('Role request rejected.', 'success');
        loadPendingRoleRequests();
        loadDashboardStats();
    })
    .catch(error => showNotification(error.message || 'Could not reject role request', 'danger'));
}
