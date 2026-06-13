// Runtime slice from daawah.js: loadResources.
function loadResources() {
    const container = document.getElementById('resourcesGrid');
    if (!container) return;

    const resourceRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getResources'))
        : fetch('admin_supabase-required-endpoint?action=getResources').then(response => parseJsonResponse(response));

    resourceRequest
    .then(result => {
        const resources = result.data || [];
        if (!resources.length) {
            container.innerHTML = '<p class="text-center text-muted">No resources have been added yet.</p>';
            return;
        }
        window.currentResources = resources;
        container.innerHTML = `<div class="row">${resources.map(res => `
            <div class="col-md-4 mb-3">
                <div class="card resource-card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-${getResourceIcon(res.resource_type || res.type)} fa-3x mb-3" style="color: var(--primary-color);"></i>
                        <h6>${res.title}</h6>
                        <p class="text-muted small">${res.description || ''}</p>
                        <button class="btn btn-sm btn-primary" onclick="openResource(${resources.indexOf(res)})">View</button>
                    </div>
                </div>
            </div>
        `).join('')}</div>`;
    })
    .catch(error => {
        console.error('Resource loading error:', error);
        container.innerHTML = '<p class="text-center text-danger">Resources could not load. Please open the site through http://localhost/comahs/index.html and try again.</p>';
    });
}
