// Runtime slice from admin.js: resetMyAdminPassword.
function resetMyAdminPassword() {
    showAdminLogin('');
    const emailInput = document.getElementById('adminForgotEmail');
    if (emailInput && currentAdmin?.email) {
        emailInput.value = currentAdmin.email;
    }
    bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
}
