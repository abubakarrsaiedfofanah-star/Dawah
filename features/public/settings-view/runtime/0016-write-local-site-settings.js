// Runtime slice from daawah.js: writeLocalSiteSettings.
function writeLocalSiteSettings(settings) {
    localStorage.setItem('siteSettings', JSON.stringify({ ...getLocalSiteSettings(), ...(settings || {}) }));
}

// Runtime slice from daawah.js: rememberPortalAudience.
function rememberPortalAudience(audience) {
    if (!audience) return;
    localStorage.setItem(PORTAL_AUDIENCE_KEY, audience);
    applyPortalAccessRules();
}

// Runtime slice from daawah.js: isAdminPortalClosed.
function isAdminPortalClosed() {
    const settings = readStoredObject('siteSettings', {});
    return localStorage.getItem(ADMIN_PORTAL_CLOSED_KEY) === '1' ||
        settings.admin_portal_closed === true ||
        String(settings.admin_portal_closed || '').toLowerCase() === 'true';
}

// Runtime slice from daawah.js: applyPortalAccessRules.
function applyPortalAccessRules() {
    const audience = localStorage.getItem(PORTAL_AUDIENCE_KEY) || '';
    const isAdminAudience = audience === 'admin';
    const hideAdminPortal = !isAdminAudience && (isAdminPortalClosed() || ['student', 'officer'].includes(audience));
    document.querySelectorAll('[data-admin-portal-card], .portal-card-admin').forEach(card => {
        card.classList.toggle('d-none', hideAdminPortal);
        card.setAttribute('aria-hidden', hideAdminPortal ? 'true' : 'false');
    });
    document.querySelectorAll('.portal-card-student, .portal-card-officer').forEach(card => {
        card.classList.toggle('d-none', isAdminAudience);
        card.setAttribute('aria-hidden', isAdminAudience ? 'true' : 'false');
    });
}
