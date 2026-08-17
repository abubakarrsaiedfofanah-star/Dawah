// Runtime slice from admin.js: listLocalAdminAccounts.
function listLocalAdminAccounts() {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    const admins = getLocalAdminAccounts().map(admin => ({
        ...publicAdminAccount(admin),
        status: admin.status || 'active',
        is_current: sessionAdmin && Number(sessionAdmin.id) === Number(admin.id)
    }));
    return {
        success: true,
        data: {
            admins,
            admin_count: admins.length,
            admin_limit: ADMIN_ACCOUNT_LIMIT
        }
    };
}
