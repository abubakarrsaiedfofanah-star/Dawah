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
    allEvents = readList('allEvents');
    cloudStoresReadyPromise = loadSharedMemberStore();
    await cloudStoresReadyPromise;
    clearCachedStudentAccountsOnce();

    if (new URLSearchParams(location.search).get('dashboard') === '1' && window.DawaahCloud?.enabled && window.DawaahCloud.hasAuthSession()) {
        const cloudMember = await window.DawaahCloud.loadMyMember().catch(() => null);
        if (cloudMember && String(cloudMember.status || '').toLowerCase() === 'active') {
            localStorage.setItem('currentUser', JSON.stringify(cloudMember));
            localStorage.setItem('currentRole', cloudMember.role || 'student');
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
    } else {
        document.documentElement.classList.remove('pending-auth-route');
        if (!showPublicHashSection()) {
            setPublicSectionVisibility('home');
        }
    }
}
