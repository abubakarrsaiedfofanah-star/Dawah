// Runtime slice from admin.js: deleteResource.
function deleteResource(resourceId) {
    fetch(`${API_URL}?action=deleteResource`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resourceId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not delete resource');
        showNotification('Resource deleted.', 'success');
        loadResourcesAdmin();
    })
    .catch(error => showNotification(error.message, 'danger'));
}
