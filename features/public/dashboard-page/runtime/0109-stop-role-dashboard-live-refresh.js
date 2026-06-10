// Runtime slice from daawah.js: stopRoleDashboardLiveRefresh.
function stopRoleDashboardLiveRefresh() {
    stopRoleRealtimeListeners();
    if (!roleDashboardRefreshTimer) return;
    clearInterval(roleDashboardRefreshTimer);
    roleDashboardRefreshTimer = null;
    roleDashboardRefreshRunning = false;
}
