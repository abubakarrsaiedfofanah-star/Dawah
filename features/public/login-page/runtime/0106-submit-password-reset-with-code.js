// Runtime slice from daawah.js: submitPasswordResetWithCode.
function submitPasswordResetWithCode() {
    const code = document.getElementById('forgotCode').value.trim();
    const password = document.getElementById('forgotNewPassword').value;
    const confirmPassword = document.getElementById('forgotConfirmPassword').value;

    if (!/^\d{6}$/.test(code)) {
        showNotification('Enter the 6-digit code sent to your email.', 'warning');
        return;
    }
    if (!password || password.length < 6) {
        showNotification('New password must be at least 6 characters.', 'warning');
        return;
    }
    if (password !== confirmPassword) {
        showNotification('New passwords do not match.', 'warning');
        return;
    }

    const resetRequest = frontendOnly
        ? Promise.resolve(resetLocalPasswordWithCode(resetPasswordEmail, code, password))
        : fetch('firestore-disabled-endpoint?action=resetPasswordWithCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: resetPasswordEmail,
            code,
            password
        })
    }).then(response => parseJsonResponse(response));

    resetRequest.then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not reset password');
        }
        showNotification('Password reset successfully. Login with your new password.', 'success');
        bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'))?.hide();
        resetForgotPasswordModal();
    })
    .catch(error => showNotification(error.message || 'Could not reset password', 'danger'));
}

// DASHBOARD
