// Runtime slice from daawah.js: hideInstallAppBanner.
function hideInstallAppBanner() {
    document.querySelectorAll('.app-install-trigger, #installAppButton').forEach(button => {
        button.classList.add('d-none');
    });
}
