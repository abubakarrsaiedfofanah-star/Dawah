// Runtime slice from daawah.js: initializeApp.
async function initializeApp() {
    registerInstallableApp();
    checkForAppUpdate();
    // Load stored data before rendering any logged-in dashboard view.
    registeredEvents = readList('registeredEvents');
    welfareRequests = readList('welfareRequests');
    donations = readList('donations');
    payments = readList('payments');
    leadershipRoles = readList('leadershipRoles');
    allMembers = readList('allMembers');
    clearCachedStudentAccountsOnce();
    allEvents = readList('allEvents');
    cloudStoresReadyPromise = loadSharedMemberStore();

    if (new URLSearchParams(location.search).get('dashboard') === '1' && window.SupabaseBackend?.enabled) {
        const cloudMember = window.SupabaseBackend.hasAuthSession()
            ? await window.SupabaseBackend.loadMyMember().catch(() => null)
            : null;
        if (cloudMember && String(cloudMember.status || '').trim().toLowerCase() === 'active') {
            const stored = getStoredCurrentUser() || {};
            const verifiedUser = { ...stored, ...cloudMember };
            localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
            localStorage.setItem('currentRole', verifiedUser.role || 'student');
        } else {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentRole');
        }
    }

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = getStoredCurrentUser();
        if (!currentUser) {
            localStorage.removeItem('currentUser');
            document.documentElement.classList.remove('pending-auth-route');
            return;
        }
        currentRole = currentUser.role || localStorage.getItem('currentRole') || 'student';
        localStorage.setItem('currentRole', currentRole);
        if (!frontendOnly && !currentUser.csrf_token) {
            refreshUserSessionToken().catch(() => {});
        }
        showDashboard();
        cloudStoresReadyPromise.catch(error => {
            console.warn('Background member refresh failed during startup:', error);
        });
    } else {
        document.documentElement.classList.remove('pending-auth-route');
        if (!showPublicHashSection()) {
            setPublicSectionVisibility('home');
        }
    }
}
