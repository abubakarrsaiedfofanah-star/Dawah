// Runtime slice from admin.js: saveLocalAdminAccounts.
function saveLocalAdminAccounts(accounts) {
    localStorage.setItem(LOCAL_ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
    saveCloudStore(LOCAL_ADMIN_ACCOUNTS_KEY, accounts);
}
