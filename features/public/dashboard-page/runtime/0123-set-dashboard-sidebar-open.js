// Runtime slice from daawah.js: setDashboardSidebarOpen.
function setDashboardSidebarOpen(isOpen) {
    const dashboardPage = document.getElementById('dashboardPage');
    if (!dashboardPage) return;
    dashboardPage.classList.toggle('dashboard-sidebar-open', isOpen);
    const toggle = document.getElementById('dashboardSidebarToggle');
    if (toggle) {
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
}
