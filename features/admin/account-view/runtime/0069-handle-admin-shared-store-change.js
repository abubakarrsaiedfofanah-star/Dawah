// Runtime slice from admin.js: handleAdminSharedStoreChange.
function handleAdminSharedStoreChange(event) {
    if (!['allMembers', 'payments', 'donations', 'welfareRequests', 'registeredEvents'].includes(event.key)) return;
    loadDashboardStatsFromLocal();
    const accountView = document.getElementById('accountView');
    if (accountView?.classList.contains('active') && currentAdmin?.isMainAdmin) {
        loadPendingRoleRequests();
        loadRoleAssignableMembers();
    }
    if (lastDashboardDetailType) {
        loadDashboardDetailFromLocal(lastDashboardDetailType);
    }
}
