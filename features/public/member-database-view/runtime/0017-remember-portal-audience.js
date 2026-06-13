// Runtime slice from daawah.js: rememberPortalAudience.
function rememberPortalAudience(audience) {
    if (!audience) return;
    localStorage.setItem(PORTAL_AUDIENCE_KEY, audience);
    applyPortalAccessRules();
}
