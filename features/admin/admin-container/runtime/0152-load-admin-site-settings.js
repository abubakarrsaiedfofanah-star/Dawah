// Runtime slice from admin.js: loadAdminSiteSettings.
function loadAdminSiteSettings() {
    fetch(`${API_URL}?action=getSiteSettings`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not load site settings');
        populateAdminSiteSettings(result.data || {});
    })
    .catch(error => {
        populateAdminSiteSettings(getLocalSiteSettings());
        showNotification(error.message || 'Using local site settings.', 'warning');
    });
}
