// Runtime slice from admin.js: closePublicAdminPortal.
function closePublicAdminPortal() {
    localStorage.setItem(ADMIN_PORTAL_CLOSED_KEY, '1');
    const settings = { ...getLocalSiteSettings(), admin_portal_closed: true };
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.()) {
        window.SupabaseBackend.saveSiteSettings(settings).catch(error => {
            console.warn('Could not close public admin portal in Supabase:', error);
        });
        return;
    }
    if (!useStaticAdminApi) {
        fetch(`${API_URL}?action=updateSiteSettings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        }).catch(error => {
            console.warn('Could not close public admin portal on server:', error);
        });
    }
}
