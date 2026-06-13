// Runtime slice from admin.js: loadResourcesAdmin.
function loadResourcesAdmin() {
    fetch(`${API_URL}?action=getResources`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('resourcesList');
        const resources = result.data || [];
        if (!resources.length) {
            container.innerHTML = '<p class="text-muted">No resources added yet.</p>';
            return;
        }
        container.innerHTML = resources.map(res => `
            <div class="item-card">
                <div class="item-info flex-grow-1">
                    <h5>${res.title}</h5>
                    <p>${res.description || ''}</p>
                    <small>${res.resource_type || res.type || 'resource'} ${res.category ? '- ' + res.category : ''}</small>
                </div>
                <div class="item-actions">
                    ${res.url || res.file_path ? `<a class="btn btn-sm btn-outline-primary" href="${resolveAdminUrl(res.url || res.file_path)}" target="_blank">Open</a>` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteResource(${res.id})">Delete</button>
                </div>
            </div>
        `).join('');
    });
}
