// Runtime slice from daawah.js: loadPublicSiteSettings.
function loadPublicSiteSettings() {
    const request = window.SupabaseBackend?.enabled
        ? window.SupabaseBackend.loadSiteSettings().then(data => ({ success: true, data }))
        : frontendOnly
        ? Promise.resolve(getStaticApiData('getSiteSettings'))
        : fetch('supabase-required-endpoint?action=getSiteSettings').then(response => parseJsonResponse(response));

    return request
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not load site settings');
            writeLocalSiteSettings(result.data || {});
            applyPublicSiteSettings(result.data || {});
        })
        .catch(() => applyPublicSiteSettings(getLocalSiteSettings()));
}
