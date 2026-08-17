// Runtime slice from admin.js: loadDashboardStats.
function loadDashboardStats() {
    renderBackupStatus();
    refreshCloudAdminStores(true)
        .finally(loadDashboardStatsFromLocal);
}
