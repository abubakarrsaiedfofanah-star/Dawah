// Runtime slice from admin.js: addResource.
function addResource() {
    const title = document.getElementById('resourceTitle').value.trim();
    const resourceType = document.getElementById('resourceType').value;
    const resourceFile = document.getElementById('resourceFile').files[0];
    const resourceUrl = document.getElementById('resourceUrl').value.trim();

    if (!title || !resourceType) {
        showNotification('Title and type are required.', 'warning');
        return;
    }
    if (!resourceFile && !resourceUrl) {
        showNotification('Please upload a file or enter a URL.', 'warning');
        return;
    }

    const data = new FormData();
    data.append('title', title);
    data.append('description', document.getElementById('resourceDescription').value.trim());
    data.append('resource_type', resourceType);
    data.append('category', document.getElementById('resourceCategory').value.trim());
    data.append('url', resourceUrl);
    if (resourceFile) {
        data.append('resource_file', resourceFile);
    }

    fetch(`${API_URL}?action=addResource`, {
        method: 'POST',
        body: data
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not add resource');
        ['resourceTitle', 'resourceDescription', 'resourceCategory', 'resourceUrl'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('resourceFile').value = '';
        showNotification('Resource added.', 'success');
        loadResourcesAdmin();
    })
    .catch(error => showNotification(error.message, 'danger'));
}
