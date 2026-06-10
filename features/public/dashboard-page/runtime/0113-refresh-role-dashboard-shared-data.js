// Runtime slice from daawah.js: refreshRoleDashboardSharedData.
async function refreshRoleDashboardSharedData() {
    if (!currentUser || roleDashboardRefreshRunning) return;
    roleDashboardRefreshRunning = true;
    try {
        await refreshLocalRoleStores();
        if (window.DawaahCloud?.enabled && window.DawaahCloud.hasAuthSession?.()) {
            await refreshCloudRoleStores();
        }
        refreshActiveRoleView();
    } catch (error) {
        console.warn('Role dashboard live refresh failed:', error);
    } finally {
        roleDashboardRefreshRunning = false;
    }
}
