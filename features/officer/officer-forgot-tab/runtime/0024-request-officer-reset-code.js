// Runtime slice from officer.js: requestOfficerResetCode.
function requestOfficerResetCode(email, button) {
    if (window.DawaahCloud?.enabled && typeof window.DawaahCloud.sendPasswordResetEmail === 'function') {
        return window.DawaahCloud.sendPasswordResetEmail(email)
            .then(result => {
                showOfficerAlert('Password reset email sent. Open your email link to set a new password.', 'success');
                document.getElementById('officerResetPasswordForm')?.classList.add('d-none');
                officerResetEmail = '';
                return { success: true, data: result };
            })
            .finally(() => setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code'));
    }

    if (frontendOnly) {
        return Promise.resolve(createLocalResetCode(email))
            .then(result => {
                showOfficerAlert(`Local reset code created. Test code: ${result.data.dev_code}. It expires in 15 minutes.`, 'warning');
                showOfficerResetStep(email);
                return result;
            })
            .finally(() => setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code'));
    }

    return fetchOfficerApi('firestore-disabled-endpoint?action=requestPasswordReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not send reset code.');
        }
        const mailSent = result.data?.mail_sent !== false;
        const devCode = result.data?.dev_code ? ` Local test code: ${result.data.dev_code}` : '';
        showOfficerAlert(mailSent
            ? 'Reset code sent to your registered email.'
            : `Reset code was created, but email delivery is not configured on this server.${devCode}`,
            mailSent ? 'success' : 'warning'
        );
        showOfficerResetStep(email);
        return result;
    })
    .finally(() => setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code'));
}
