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
