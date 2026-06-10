// Runtime slice from daawah.js: wireInstallAppBanner.
function wireInstallAppBanner() {
    document.getElementById('installAppTopButton')?.addEventListener('click', installDawaahApp);
    updateInstallAppBanner();
    updateInstallButtonLabels('Install App');
}
