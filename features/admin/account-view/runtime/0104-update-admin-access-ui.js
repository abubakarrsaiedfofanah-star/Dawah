// Runtime slice from admin.js: updateAdminAccessUi.
function updateAdminAccessUi() {
    const mainAdminAccountTools = document.getElementById('mainAdminAccountTools');
    mainAdminAccountTools?.classList.toggle('d-none', !currentAdmin?.isMainAdmin);
}
