// Runtime slice from officer.js: handleOfficerResetPassword.
function handleOfficerResetPassword(event) {
    event.preventDefault();
    clearOfficerAlert();
    const email = officerResetEmail || document.getElementById('officerForgotEmail')?.value.trim() || '';
    const code = document.getElementById('officerResetCode')?.value.trim() || '';
    const password = document.getElementById('officerResetPassword')?.value || '';
    const confirmPassword = document.getElementById('officerResetConfirmPassword')?.value || '';
    const button = document.getElementById('officerResetButton');

    if (!email) {
        showOfficerAlert('Please request a reset code with your registered email first.', 'warning');
        return;
    }
    if (!/^\d{6}$/.test(code)) {
        showOfficerAlert('Enter the 6-digit code sent to your email.', 'warning');
        return;
    }
    if (password !== confirmPassword) {
        showOfficerAlert('Passwords do not match.', 'warning');
        return;
    }
    if (password.length < 6) {
        showOfficerAlert('Password must be at least 6 characters.', 'warning');
        return;
    }
    setButtonLoading(button, true, 'Resetting...');
    const resetRequest = frontendOnly
        ? Promise.resolve(resetLocalPasswordWithCode(email, code, password))
        : fetchOfficerApi('supabase-required-endpoint?action=resetPasswordWithCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password })
    });

    resetRequest.then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not reset password.');
        }
        showOfficerAlert('Password reset successfully. Login with your new password.', 'success');
        document.getElementById('officerForgotPasswordForm')?.reset();
        document.getElementById('officerResetPasswordForm')?.reset();
        document.getElementById('officerResetPasswordForm')?.classList.add('d-none');
        officerResetEmail = '';
        document.getElementById('officerLoginTabBtn')?.click();
    })
    .catch(error => showOfficerAlert(error.message || 'Could not reset password.', 'danger'))
    .finally(() => setButtonLoading(button, false, '<i class="fas fa-key"></i> Set New Password'));
}
