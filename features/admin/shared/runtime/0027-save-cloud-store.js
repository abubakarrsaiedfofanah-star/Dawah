// Runtime slice from admin.js: saveCloudStore.
function saveCloudStore(key, data) {
    if (!window.DawaahCloud?.enabled) return;
    if (key === 'allMembers' && Array.isArray(data)) {
        data.forEach(member => {
            if (member?.uid) {
                window.DawaahCloud.saveMember(member).catch(error => {
                    console.error('Firestore member update failed:', error);
                });
            }
            if (String(member?.status || '').toLowerCase() === 'active') {
                window.DawaahCloud.saveMemberVerification?.(member).catch(error => {
                    console.error('Firestore member verification update failed:', error);
                });
            }
        });
        return;
    }
    window.DawaahCloud.saveStore(key, data).catch(error => {
        console.error(`Firestore sync failed for ${key}:`, error);
    });
}

// Runtime slice from admin.js: closePublicAdminPortal.
function closePublicAdminPortal() {
    localStorage.setItem(ADMIN_PORTAL_CLOSED_KEY, '1');
    const settings = { ...getLocalSiteSettings(), admin_portal_closed: true };
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    if (window.DawaahCloud?.enabled && window.DawaahCloud.hasAuthSession?.()) {
        window.DawaahCloud.saveSiteSettings(settings).catch(error => {
            console.warn('Could not close public admin portal in Firestore:', error);
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
