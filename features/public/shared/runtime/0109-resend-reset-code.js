// Runtime slice from daawah.js: resendResetCode.
function resendResetCode() {
    const actionButton = document.getElementById('forgotPasswordActionButton');
    const resendButton = document.getElementById('forgotPasswordResendButton');
    const email = resetPasswordEmail || document.getElementById('forgotEmail')?.value.trim();
    if (!email) {
        showNotification('Enter your registered email first.', 'warning');
        return;
    }

    if (resendButton?.disabled) return;
    if (resendButton) {
        resendButton.disabled = true;
        resendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }
    if (actionButton) actionButton.disabled = true;

    const unlockResetButtons = () => {
        if (resendButton) {
            resendButton.disabled = false;
            resendButton.textContent = 'Resend Code';
        }
        if (actionButton) actionButton.disabled = false;
    };

    if (window.SupabaseBackend?.enabled && typeof window.SupabaseBackend.sendPasswordResetEmail === 'function') {
        window.SupabaseBackend.sendPasswordResetEmail(email)
            .then(() => showNotification('New password reset email sent.', 'success'))
            .catch(error => showNotification(error.message || 'Could not resend reset email.', 'danger'))
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
            throw new Error(result.message || 'Could not resend reset code');
        }
        document.getElementById('forgotCode').value = '';
        showNotification(result.data?.mail_sent ? 'New verification code sent.' : 'New code created. If email is not delivered, check mail setup.', 'success');
        showResetCodeStep(email, result);
    })
    .catch(error => showNotification(error.message || 'Could not resend reset code', 'danger'))
    .finally(unlockResetButtons);
}
