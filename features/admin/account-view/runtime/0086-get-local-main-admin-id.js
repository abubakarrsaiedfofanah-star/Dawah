// Runtime slice from admin.js: getLocalMainAdminId.
function getLocalMainAdminId() {
    const accounts = getLocalAdminAccounts();
    return Number((accounts[0] || {}).id || 0);
}
