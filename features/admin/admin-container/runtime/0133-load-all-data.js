// Runtime slice from admin.js: loadAllData.
function loadAllData() {
    renderBackupStatus();
    loadDashboardStats();
    if (currentAdmin?.isMainAdmin) {
        loadPendingRoleRequests();
    }
    runSystemHealthCheck({ silent: true });
}
