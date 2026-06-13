// Runtime slice from daawah.js: refreshActiveRoleView.
function refreshActiveRoleView() {
    const activeView = document.querySelector('.view-container.active');
    const viewName = activeView?.id?.replace(/View$/, '') || 'dashboard';
    if (viewName === 'dashboard') {
        loadDashboardData();
        return;
    }
    if (['memberDatabase', 'dues', 'donations', 'reports', 'adminWelfare', 'events'].includes(viewName)) {
        loadViewData(viewName);
    } else {
        updateDashboardStats();
    }
}

// VIEW SWITCHING
