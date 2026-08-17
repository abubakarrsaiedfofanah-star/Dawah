// Runtime slice from daawah.js: toggleDashboardSidebar.
function toggleDashboardSidebar() {
    const dashboardPage = document.getElementById('dashboardPage');
    setDashboardSidebarOpen(!dashboardPage?.classList.contains('dashboard-sidebar-open'));
}
