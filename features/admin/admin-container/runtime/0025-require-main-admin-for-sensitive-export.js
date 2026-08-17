// Runtime slice from admin.js: requireMainAdminForSensitiveExport.
function requireMainAdminForSensitiveExport() {
    if (currentAdmin?.isMainAdmin) return true;
    showNotification('Only the main admin can export sensitive system records.', 'warning');
    return false;
}
