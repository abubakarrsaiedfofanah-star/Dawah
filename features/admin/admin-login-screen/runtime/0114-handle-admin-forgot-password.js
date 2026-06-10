// Runtime slice from admin.js: handleAdminForgotPassword.
async function handleAdminForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('adminForgotEmail').value.trim();
    const button = document.getElementById('adminForgotButton');
    const error = document.getElementById('adminLoginError');

    if (error) {
        error.textContent = '';
        error.classList.remove('active');
    }

    if (!isEmailLoginIdentifier(email)) {
        showAdminLogin('Please login with the registered admin email address only.');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        if (window.DawaahCloud?.enabled && typeof window.DawaahCloud.sendPasswordResetEmail === 'function') {
            await window.DawaahCloud.sendPasswordResetEmail(email);
            showNotification('Password reset email sent. Open your email link to set a new password.', 'success');
            return;
        }

        const response = await fetch(`${API_URL}?action=requestAdminPasswordReset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const result = await parseJsonResponse(response);
        if (!result.success) {
            showAdminLogin(result.message || 'Could not send admin reset code.');
            bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
            return;
        }
        showNotification('If this email belongs to an active admin, a reset code was sent there.', 'success');
    } catch (error) {
        showAdminLogin('Could not send reset code. Check the server email configuration.');
        bootstrap.Tab.getOrCreateInstance(document.getElementById('adminForgotTabBtn')).show();
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-envelope"></i> Send Reset Code';
    }
}
