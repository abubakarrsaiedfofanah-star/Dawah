// Runtime slice from officer.js: toggleOfficerPassword.
function toggleOfficerPassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input || !button) return;
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    button.innerHTML = showing ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
}
