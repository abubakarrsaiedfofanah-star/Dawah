// Runtime slice from daawah.js: resetForgotPasswordModal.
function resetForgotPasswordModal() {
    resetPasswordEmail = '';
    document.getElementById('forgotPasswordForm')?.reset();
    document.querySelectorAll('.reset-step-code').forEach(item => item.classList.add('d-none'));
    document.querySelectorAll('.reset-step-email').forEach(item => item.classList.remove('d-none'));
    const button = document.getElementById('forgotPasswordActionButton');
    if (button) button.textContent = 'Send Code';
    const resendButton = document.getElementById('forgotPasswordResendButton');
    if (resendButton) resendButton.classList.add('d-none');
    const help = document.getElementById('forgotPasswordHelp');
    if (help) help.textContent = 'Use the same email you registered with. A verification code will be sent there.';
}
