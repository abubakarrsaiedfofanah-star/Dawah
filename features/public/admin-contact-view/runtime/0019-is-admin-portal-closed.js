// Runtime slice from daawah.js: isAdminPortalClosed.
function isAdminPortalClosed() {
    const settings = readStoredObject('siteSettings', {});
    return localStorage.getItem(ADMIN_PORTAL_CLOSED_KEY) === '1' ||
        settings.admin_portal_closed === true ||
        String(settings.admin_portal_closed || '').toLowerCase() === 'true';
}
