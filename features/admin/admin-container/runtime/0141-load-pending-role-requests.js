// Runtime slice from admin.js: loadPendingRoleRequests.
function loadPendingRoleRequests() {
    const container = document.getElementById('pendingRoleRequestsList');
    if (!container) return;
    container.innerHTML = '<p class="text-muted">Loading pending role requests...</p>';

    refreshCloudAdminStores(true)
    .then(() => fetch(`${API_URL}?action=getPendingRoleRequests`))
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load role requests');
        }
        renderPendingRoleRequests(result.data || []);
    })
    .catch(error => {
        container.innerHTML = `<p class="text-danger">${escapeAdminText(error.message || 'Could not load role requests')}</p>`;
    });
}
