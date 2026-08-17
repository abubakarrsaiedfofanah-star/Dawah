// Runtime slice from daawah.js: sendResetLink.
function sendResetLink() {
    if (resetPasswordEmail) {
        submitPasswordResetWithCode();
        return;
    }

    const actionButton = document.getElementById('forgotPasswordActionButton');
    const resendButton = document.getElementById('forgotPasswordResendButton');
    const email = document.getElementById('forgotEmail').value.trim();
    if (!email) {
        showNotification('Please enter your email address.', 'warning');
        return;
    }

    if (actionButton?.disabled) return;
    if (actionButton) {
        actionButton.disabled = true;
        actionButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }
    if (resendButton) resendButton.disabled = true;

    const unlockResetButtons = () => {
        if (actionButton) {
            actionButton.disabled = false;
            actionButton.textContent = resetPasswordEmail ? 'Set New Password' : 'Send Code';
        }
        if (resendButton) resendButton.disabled = false;
    };

    if (window.SupabaseBackend?.enabled && typeof window.SupabaseBackend.sendPasswordResetEmail === 'function') {
        window.SupabaseBackend.sendPasswordResetEmail(email)
            .then(() => {
                showNotification('Password reset email sent. Open your email link to set a new password.', 'success');
                bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'))?.hide();
                resetForgotPasswordModal();
            })
            .catch(error => showNotification(error.message || 'Could not send reset email.', 'danger'))
            .finally(unlockResetButtons);
        return;
    }

    const resetRequest = frontendOnly
        ? Promise.resolve(createLocalResetCode(email))
        : fetch('supabase-required-endpoint?action=requestPasswordReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    }).then(response => parseJsonResponse(response));

    resetRequest.then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not record reset request');
        }
        showNotification(result.data?.mail_sent ? 'Verification code sent to your email.' : 'Code created. If email is not delivered, contact admin to check mail setup.', 'success');
        showResetCodeStep(email, result);
    })
    .catch(error => showNotification(error.message || 'Could not send reset code', 'danger'))
    .finally(unlockResetButtons);
}
