// Runtime slice from daawah.js: openResource.
function openResource(resourceIndex) {
    const resource = Array.isArray(window.currentResources) ? window.currentResources[resourceIndex] : null;
    if (!resource) {
        alert('Resource was not found. Please refresh and try again.');
        return;
    }

    const resourceUrl = resource.url || resource.file_path || '';
    if (resourceUrl) {
        window.open(resolveAppUrl(resourceUrl), '_blank');
        return;
    }
    alert(`${resource.title}\n\n${resource.description || 'No details available.'}`);
}
