// Runtime slice from daawah.js: showLoginPage.
function showLoginPage() {
    document.documentElement.classList.remove('pending-auth-route');
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
}
