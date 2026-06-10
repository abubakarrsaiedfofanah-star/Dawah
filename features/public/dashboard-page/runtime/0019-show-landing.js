// Runtime slice from daawah.js: showLanding.
function showLanding() {
    document.documentElement.classList.remove('pending-auth-route');
    document.getElementById('landingPage').classList.add('active');
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.remove('active');
    setPublicSectionVisibility('');
}
