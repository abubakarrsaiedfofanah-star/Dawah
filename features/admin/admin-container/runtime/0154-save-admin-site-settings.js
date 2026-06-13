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
        if (window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.()) {
            return window.SupabaseBackend.saveSiteSettings(settings)
                .then(() => showNotification('Public page content saved to Supabase.', 'success'));
        }
        showNotification('Public page content saved.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not save public page content', 'danger'));
}
