// Runtime slice from admin.js: findLocalAdminAccount.
function findLocalAdminAccount(adminLike) {
    const accounts = getLocalAdminAccounts();
    return accounts.find(admin => Number(admin.id) === Number(adminLike.id)) ||
        accounts.find(admin =>
            String(admin.username || '').toLowerCase() === String(adminLike.username || '').toLowerCase() ||
            String(admin.email || '').toLowerCase() === String(adminLike.email || '').toLowerCase()
        );
}
