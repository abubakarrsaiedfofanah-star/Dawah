// Runtime slice from officer.js: resendOfficerResetCode.
function resendOfficerResetCode() {
    const email = officerResetEmail || document.getElementById('officerForgotEmail')?.value.trim() || '';
    const button = document.getElementById('officerForgotButton');
    if (!email) {
        showOfficerAlert('Please enter your registered email first.', 'warning');
        return;
    }
    setButtonLoading(button, true, 'Sending...');
    try {
        requestOfficerResetCode(email, button).catch(error => {
            showOfficerAlert(error.message || 'Could not resend reset code.', 'danger');
            setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code');
        });
    } catch (error) {
        showOfficerAlert(error.message || 'Could not resend reset code.', 'danger');
        setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code');
    }
}
