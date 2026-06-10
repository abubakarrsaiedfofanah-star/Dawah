// Runtime slice from admin.js: loadMyAdminActivityLogs.
function loadMyAdminActivityLogs() {
    fetch(`${API_URL}?action=getMyAdminActivityLogs`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load your activity');
        }
        renderActivityLogTable('myAdminActivityLogList', result.data || [], {
            showMainAdminActions: false,
            showUndoActions: true
        });
    })
    .catch(error => {
        const container = document.getElementById('myAdminActivityLogList');
        if (container) container.innerHTML = `<p class="text-danger">${escapeAdminText(error.message || 'Could not load your activity')}</p>`;
    });
}
