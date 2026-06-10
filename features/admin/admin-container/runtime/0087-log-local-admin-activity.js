// Runtime slice from admin.js: logLocalAdminActivity.
function logLocalAdminActivity(actionName, details = {}) {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    if (!sessionAdmin) return;
    const activity = {
        admin_id: sessionAdmin.id,
        username: sessionAdmin.username,
        email: sessionAdmin.email || '',
        action: actionName,
        details,
        ip_address: 'local browser'
    };
    addStoreItem('adminActivityLogs', activity);
    window.DawaahCloud?.createAuditLog?.(actionName, {
        ...details,
        localAdminId: sessionAdmin.id,
        localAdminUsername: sessionAdmin.username,
        localAdminEmail: sessionAdmin.email || ''
    }).catch(error => {
        console.warn('Cloud audit log failed:', error);
    });
}
