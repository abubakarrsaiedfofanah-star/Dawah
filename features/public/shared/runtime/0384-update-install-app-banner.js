// Runtime slice from daawah.js: updateInstallAppBanner.
function updateInstallAppBanner() {
    const dismissed = localStorage.getItem('dawaahInstallBannerDismissed') === '1';
    const installed = localStorage.getItem('dawaahAppInstalled') === '1' || isStandaloneApp();
    document.querySelectorAll('.app-install-trigger, #installAppButton').forEach(button => {
        button.classList.toggle('d-none', dismissed || installed);
    });
}
