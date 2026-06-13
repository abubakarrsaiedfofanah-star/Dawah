// Runtime slice from admin.js: deleteLocalAdminAccount.
function deleteLocalAdminAccount(adminId) {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    const accounts = getLocalAdminAccounts();
    if (Number(adminId) === Number(sessionAdmin?.id)) {
        return { success: false, message: 'You cannot remove your own admin account while logged in.' };
    }
    if (accounts.length <= 1) {
        return { success: false, message: 'At least one admin account must remain.' };
    }
    const nextAccounts = accounts.filter(account => Number(account.id) !== Number(adminId));
    if (nextAccounts.length === accounts.length) {
        return { success: false, message: 'Admin account not found.' };
    }
    saveLocalAdminAccounts(nextAccounts);
    logLocalAdminActivity('deleteAdminAccount', { admin_id: adminId });
    return { success: true, message: 'Admin account removed.' };
}
