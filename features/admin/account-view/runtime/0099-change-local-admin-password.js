// Runtime slice from admin.js: changeLocalAdminPassword.
async function changeLocalAdminPassword(payload) {
    const currentPassword = String(payload.current_password || '');
    const newPassword = String(payload.new_password || '');
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    const accounts = getLocalAdminAccounts();
    const index = accounts.findIndex(account => Number(account.id) === Number(sessionAdmin?.id));
    if (index < 0) {
        return { success: false, message: 'Current admin account not found.' };
    }
    if (!currentPassword || !newPassword) {
        return { success: false, message: 'Current and new password are required.' };
    }
    if (!isStrongAdminPassword(newPassword)) {
        return { success: false, message: 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.' };
    }
    if (!(await verifyLocalAdminPassword(accounts[index], currentPassword))) {
        return { success: false, message: 'Current password is incorrect.' };
    }
    accounts[index] = {
        ...accounts[index],
        ...(await hashAdminPassword(newPassword))
    };
    saveLocalAdminAccounts(accounts);
    logLocalAdminActivity('changeAdminPassword', { admin_id: accounts[index].id });
    return { success: true, message: 'Password changed successfully.' };
}
