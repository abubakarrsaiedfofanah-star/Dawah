// Runtime slice from admin.js: showAdminLogin.
function showAdminLogin(message = '') {
    document.getElementById('adminLoginScreen')?.classList.remove('d-none');
    document.getElementById('adminContainer')?.classList.add('locked');
    const error = document.getElementById('adminLoginError');
    if (error) {
        error.textContent = message;
        error.classList.toggle('active', Boolean(message));
    }
}
