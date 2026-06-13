// Runtime slice from admin.js: loadAllData.
function loadAllData() {
    renderBackupStatus();
    loadDashboardStats();
    runSystemHealthCheck({ silent: true });
}
