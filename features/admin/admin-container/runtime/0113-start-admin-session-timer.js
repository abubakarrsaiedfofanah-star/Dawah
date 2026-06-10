// Runtime slice from admin.js: startAdminSessionTimer.
function startAdminSessionTimer() {
    clearTimeout(adminSessionTimeoutId);
    clearTimeout(adminSessionWarningId);
    adminSessionWarningId = setTimeout(() => {
        showNotification('Admin session will expire in 2 minutes. Save your work or refresh activity.', 'warning');
    }, Math.max(1000, ADMIN_SESSION_TIMEOUT_MS - 120000));
    adminSessionTimeoutId = setTimeout(() => {
        showNotification('Admin session timed out for security. Please log in again.', 'warning');
        setTimeout(logoutAdmin, 1200);
    }, ADMIN_SESSION_TIMEOUT_MS);
}
