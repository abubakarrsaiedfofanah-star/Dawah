// Runtime slice from daawah.js: showResetCodeStep.
function showResetCodeStep(email, result) {
    resetPasswordEmail = email;
    document.querySelectorAll('.reset-step-email').forEach(item => item.classList.add('d-none'));
    document.querySelectorAll('.reset-step-code').forEach(item => item.classList.remove('d-none'));
    const button = document.getElementById('forgotPasswordActionButton');
    if (button) button.textContent = 'Set New Password';
    const resendButton = document.getElementById('forgotPasswordResendButton');
    resendButton?.classList.remove('d-none');
    const help = document.getElementById('forgotPasswordHelp');
    const devCode = result?.data?.dev_code ? ` (Debug: ${result.data.dev_code})` : '';
    if (help) {
        help.textContent = `A verification code has been sent to ${email}. Please check your inbox. ${devCode}`;
    }
}
