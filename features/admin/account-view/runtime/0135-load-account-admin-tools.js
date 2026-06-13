// Runtime slice from admin.js: loadAccountAdminTools.
function loadAccountAdminTools() {
    updateAdminAccessUi();
    loadMyAdminActivityLogs();
    if (!currentAdmin?.isMainAdmin) {
        return;
    }
    loadPendingRoleRequests();
    loadRoleAssignableMembers();
    loadAdminAccounts();
    loadAdminActivityLogs();
}
