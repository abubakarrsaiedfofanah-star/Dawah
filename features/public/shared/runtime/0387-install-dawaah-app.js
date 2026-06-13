// Runtime slice from daawah.js: installDawaahApp.
function installDawaahApp() {
    if (!deferredInstallPrompt) {
        pendingInstallClick = true;
        window.__dawaahPendingInstallClick = true;
        updateInstallButtonLabels('Preparing...');
        if (typeof showNotification === 'function') {
            showNotification('Preparing app install. If nothing opens, refresh once and tap Install again.', 'info');
        }
        setTimeout(() => {
            if (!deferredInstallPrompt) {
                pendingInstallClick = false;
                window.__dawaahPendingInstallClick = false;
                updateInstallButtonLabels('Install App');
            }
        }, 3500);
        return;
    }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(() => {
        deferredInstallPrompt = null;
        window.__dawaahDeferredInstallPrompt = null;
        document.getElementById('installAppButton')?.remove();
        pendingInstallClick = false;
        window.__dawaahPendingInstallClick = false;
        updateInstallButtonLabels('Install App');
    });
}
