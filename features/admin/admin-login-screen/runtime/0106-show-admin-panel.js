// Runtime slice from admin.js: showAdminPanel.
function showAdminPanel() {
    document.getElementById('adminLoginScreen')?.classList.add('d-none');
    document.getElementById('adminContainer')?.classList.remove('locked');
    updateAdminAccessUi();
}
