// Runtime slice from daawah.js: startRoleDashboardLiveRefresh.
function startRoleDashboardLiveRefresh() {
    if (roleDashboardRefreshTimer) return;
    startRoleRealtimeListeners();
    refreshRoleDashboardSharedData();
    roleDashboardRefreshTimer = setInterval(refreshRoleDashboardSharedData, ROLE_DASHBOARD_REFRESH_MS);
}
