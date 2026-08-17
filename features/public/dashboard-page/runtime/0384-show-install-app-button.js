// Runtime slice from daawah.js: showInstallAppButton.
function showInstallAppButton() {
    const dashboardPage = document.getElementById('dashboardPage');
    if (!currentUser || !dashboardPage?.classList.contains('active')) return;
    if (localStorage.getItem('dawaahAppInstalled') === '1' || isStandaloneApp()) {
        hideInstallAppBanner();
        return;
    }
    if (document.getElementById('installAppButton')) return;
    const host = document.getElementById('dashboardInstallActions');
    if (!host) return;
    const button = document.createElement('button');
    button.id = 'installAppButton';
    button.type = 'button';
    button.className = 'btn btn-sm btn-outline-primary install-app-button';
    button.innerHTML = '<i class="fas fa-mobile-screen-button"></i> Install App';
    button.onclick = installDawaahApp;
    host.appendChild(button);
}
