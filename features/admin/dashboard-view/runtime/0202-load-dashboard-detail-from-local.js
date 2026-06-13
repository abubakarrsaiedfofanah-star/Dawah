// Runtime slice from admin.js: loadDashboardDetailFromLocal.
function loadDashboardDetailFromLocal(type) {
    fetch(`${API_URL}?action=getDashboardDetail&type=${encodeURIComponent(type)}`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load database records');
        }
        renderDashboardDetail(type, result.data.rows || []);
    })
    .catch(error => {
        console.error('Error loading dashboard detail:', error);
        showNotification(error.message || 'Error loading database records', 'danger');
    });
}
