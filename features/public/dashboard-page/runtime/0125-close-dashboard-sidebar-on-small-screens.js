// Runtime slice from daawah.js: closeDashboardSidebarOnSmallScreens.
function closeDashboardSidebarOnSmallScreens() {
    if (window.matchMedia('(max-width: 991.98px)').matches) {
        setDashboardSidebarOpen(false);
    }
}

window.toggleDashboardSidebar = toggleDashboardSidebar;
