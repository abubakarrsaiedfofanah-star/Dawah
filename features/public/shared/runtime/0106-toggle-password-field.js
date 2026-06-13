// Runtime slice from daawah.js: togglePasswordField.
function togglePasswordField(inputId, buttonId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(buttonId);
    if (!passwordInput || !toggleBtn) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        toggleBtn.setAttribute('aria-label', 'Hide password');
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.setAttribute('aria-label', 'Show password');
    }
}
