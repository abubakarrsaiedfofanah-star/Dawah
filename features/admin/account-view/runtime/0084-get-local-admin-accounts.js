// Runtime slice from admin.js: getLocalAdminAccounts.
function getLocalAdminAccounts() {
    return JSON.parse(localStorage.getItem(LOCAL_ADMIN_ACCOUNTS_KEY) || '[]');
}
