// Runtime slice from daawah.js: refreshRoleDashboardSharedData.
async function refreshRoleDashboardSharedData() {
    if (!currentUser || roleDashboardRefreshRunning) return;
    roleDashboardRefreshRunning = true;
    try {
        await refreshLocalRoleStores();
        if (window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.()) {
            await refreshCloudRoleStores();
        }
        refreshActiveRoleView();
    } catch (error) {
        console.warn('Role dashboard live refresh failed:', error);
    } finally {
        roleDashboardRefreshRunning = false;
    }
}
