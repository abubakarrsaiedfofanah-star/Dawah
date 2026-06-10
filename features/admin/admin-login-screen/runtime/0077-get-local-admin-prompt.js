// Runtime slice from admin.js: getLocalAdminPrompt.
function getLocalAdminPrompt() {
    if (useStaticAdminApi && window.DawaahCloud?.enabled) {
        return 'Login with the registered main admin email. New admins are added inside the admin panel.';
    }
    const count = getLocalAdminAccounts().length;
    if (count === 0) {
        return 'Create the first admin account. After that, admins are added inside the panel.';
    }
    return 'Login with an admin account. New admins must be added inside the panel.';
}
