// Runtime slice from admin.js: togglePasswordVisibility.
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    button?.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
    const icon = button?.querySelector('i');
    if (icon) {
        icon.className = shouldShow ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
}
