// Runtime slice from admin.js: saveAdminSiteSettings.
function saveAdminSiteSettings() {
    fetch(`${API_URL}?action=updateSiteSettings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getAdminSiteSettingsPayload())
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not save site settings');
        const settings = result.data?.settings || result.data || {};
        populateAdminSiteSettings(settings);
        if (window.DawaahCloud?.enabled && window.DawaahCloud.hasAuthSession?.()) {
            return window.DawaahCloud.saveSiteSettings(settings)
                .then(() => showNotification('Public page content saved to Firebase.', 'success'));
        }
        showNotification('Public page content saved.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not save public page content', 'danger'));
}
