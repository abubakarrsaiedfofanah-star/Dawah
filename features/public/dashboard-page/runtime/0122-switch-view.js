// Runtime slice from daawah.js: switchView.
function switchView(viewName) {
    const requiredPermission = getViewPermission(viewName);
    if (requiredPermission && !hasPermission(requiredPermission)) {
        showNotification('Your role does not have access to that section.', 'warning');
        switchView('dashboard');
        return;
    }

    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
        viewElement.classList.add('active');
    }

    const activeEvent = typeof event !== 'undefined' ? event : null;
    const clickedLink = activeEvent?.target?.closest?.('.sidebar-menu .nav-link, .navbar .nav-link');
    const matchingLink = clickedLink || document.querySelector(`.sidebar-menu .nav-link[onclick*="switchView('${viewName}')"]`);
    if (matchingLink) {
        matchingLink.classList.add('active');
    }

    // Every view is a new destination.  Resetting the document position here
    // prevents the dashboard opening at the scroll position of the previous
    // long view (and makes its summary visible as soon as it is selected).
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    closeDashboardSidebarOnSmallScreens();
    loadViewData(viewName);

    // Render cached values immediately, then request the current cloud values
    // when Dashboard is selected.  The refresh function prevents duplicate
    // requests while one is already in flight.
    if (viewName === 'dashboard') {
        refreshRoleDashboardSharedData();
    }
}

window.showDashboard = showDashboard;
window.switchView = switchView;
