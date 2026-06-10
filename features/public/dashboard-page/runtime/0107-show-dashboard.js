// Runtime slice from daawah.js: showDashboard.
function showDashboard() {
    document.documentElement.classList.remove('pending-auth-route');
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    document.getElementById('userNameDisplay').textContent = currentUser.name || currentUser.username;

    configureRoleMenus();
    switchView('dashboard');
    startRoleDashboardLiveRefresh();
    showInstallAppButton();
    updateInstallAppBanner();
    const onboardingKey = `studentOnboarding:${currentUser.email || currentUser.studentId || currentUser.username}`;
    if (localStorage.getItem(onboardingKey) === '1') {
        localStorage.removeItem(onboardingKey);
        setTimeout(() => showNotification('Welcome. Complete your profile, submit dues payment, then apply or print your membership card after approval.', 'info'), 700);
    }
    setTimeout(() => {
        loadDashboardData();
        initializeCharts();
    }, 500);
}
