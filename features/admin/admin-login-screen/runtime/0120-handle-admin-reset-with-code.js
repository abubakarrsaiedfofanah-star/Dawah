// Runtime slice from admin.js: handleAdminResetWithCode.
async function handleAdminResetWithCode(event) {
    event.preventDefault();
    const email = document.getElementById('adminForgotEmail').value.trim();
    const code = document.getElementById('adminResetCode').value.trim();
    const password = document.getElementById('adminResetNewPassword').value;
    const button = document.getElementById('adminResetWithCodeButton');

    if (!email) {
        showAdminLogin('Enter the registered admin email first.');
        bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
        return;
    }
    if (!isStrongAdminPassword(password)) {
        showAdminLogin('Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.');
        bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';

    try {
        const result = await fetch(`${API_URL}?action=resetAdminPasswordWithCode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, password })
            }).then(response => parseJsonResponse(response));
        if (!result.success) {
            showAdminLogin(result.message || 'Could not reset admin password.');
            bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
            return;
        }
        document.getElementById('adminForgotPasswordForm')?.reset();
        document.getElementById('adminResetWithCodeForm')?.reset();
        showNotification('Admin password reset successfully. Login with the new password.', 'success');
        bootstrap.Tab.getOrCreateInstance(document.getElementById('adminLoginTabBtn')).show();
    } catch (error) {
        showAdminLogin('Could not reset admin password. Check the code and try again.');
        bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-key"></i> Set New Password';
    }
}
