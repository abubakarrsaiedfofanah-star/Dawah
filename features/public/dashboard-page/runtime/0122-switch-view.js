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

    closeDashboardSidebarOnSmallScreens();
    loadViewData(viewName);
}

window.showDashboard = showDashboard;
window.switchView = switchView;
