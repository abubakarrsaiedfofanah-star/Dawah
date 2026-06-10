// Runtime slice from daawah.js: showResetCodeStep.
function showResetCodeStep(email, result) {
    resetPasswordEmail = email;
    document.querySelectorAll('.reset-step-email').forEach(item => item.classList.add('d-none'));
    document.querySelectorAll('.reset-step-code').forEach(item => item.classList.remove('d-none'));
    const button = document.getElementById('forgotPasswordActionButton');
    if (button) button.textContent = 'Set New Password';
    const resendButton = document.getElementById('forgotPasswordResendButton');
    if (resendButton) resendButton.classList.remove('d-none');
    const help = document.getElementById('forgotPasswordHelp');
    if (help) {
        const devCode = result?.data?.dev_code ? ` Local test code: ${result.data.dev_code}` : '';
        help.textContent = `Code sent to ${email}. It expires in 15 minutes.${devCode}`;
    }
}
