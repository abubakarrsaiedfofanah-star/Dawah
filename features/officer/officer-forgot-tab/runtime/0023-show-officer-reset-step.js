// Runtime slice from officer.js: showOfficerResetStep.
function showOfficerResetStep(email) {
    officerResetEmail = email;
    const resetForm = document.getElementById('officerResetPasswordForm');
    if (resetForm) resetForm.classList.remove('d-none');
    const resetCode = document.getElementById('officerResetCode');
    if (resetCode) resetCode.value = '';
    document.getElementById('officerResetCode')?.focus();
}
