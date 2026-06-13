// Runtime slice from admin.js: refreshAdminRegistrationCapture.
async function refreshAdminRegistrationCapture() {
    if (!currentAdmin) return;
    await refreshCloudAdminStores(true);
    loadDashboardStatsFromLocal();
    const accountView = document.getElementById('accountView');
    if (accountView?.classList.contains('active') && currentAdmin?.isMainAdmin) {
        loadPendingRoleRequests();
        loadRoleAssignableMembers();
    }
}
