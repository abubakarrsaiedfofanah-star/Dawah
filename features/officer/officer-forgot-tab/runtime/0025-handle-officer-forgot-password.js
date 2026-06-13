// Runtime slice from officer.js: handleOfficerForgotPassword.
function handleOfficerForgotPassword(event) {
    event.preventDefault();
    clearOfficerAlert();
    const email = document.getElementById('officerForgotEmail')?.value.trim() || '';
    const button = document.getElementById('officerForgotButton');
    if (!email) {
        showOfficerAlert('Please enter the email you registered with.', 'warning');
        return;
    }

    setButtonLoading(button, true, 'Sending...');
    try {
        requestOfficerResetCode(email, button).catch(error => {
            showOfficerAlert(error.message || 'Could not send reset code.', 'danger');
            setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code');
        });
    } catch (error) {
        showOfficerAlert(error.message || 'Could not send reset code.', 'danger');
        setButtonLoading(button, false, '<i class="fas fa-envelope"></i> Send Reset Code');
    }
}
