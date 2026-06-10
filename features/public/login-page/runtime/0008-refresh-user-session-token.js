// Runtime slice from daawah.js: refreshUserSessionToken.
function refreshUserSessionToken() {
    if (frontendOnly) return Promise.reject(new Error('No backend session available.'));
    return realAppFetch('firestore-disabled-endpoint?action=getSession', { credentials: 'same-origin', cache: 'no-store' })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !result.data?.csrf_token) {
                throw new Error(result.message || 'Session expired. Please login again.');
            }
            currentUser = { ...(currentUser || getStoredCurrentUser() || {}), ...result.data };
            currentRole = currentUser.role || currentRole;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            if (currentRole) localStorage.setItem('currentRole', currentRole);
            return currentUser.csrf_token;
        });
}
