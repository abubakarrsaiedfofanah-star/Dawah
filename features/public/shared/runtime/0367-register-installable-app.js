// Runtime slice from daawah.js: registerInstallableApp.
function registerInstallableApp() {
    ensureAppManifestLink();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                registration.update().catch(() => {});
                if (!navigator.serviceWorker.controller && !sessionStorage.getItem('dawaahSwFirstControlReload')) {
                    sessionStorage.setItem('dawaahSwFirstControlReload', '1');
                    setTimeout(() => window.location.reload(), 1200);
                }
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
            })
            .catch(() => {});
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            const reloadKey = `serviceWorkerReloaded:${APP_VERSION}`;
            if (sessionStorage.getItem(reloadKey)) return;
            sessionStorage.setItem(reloadKey, '1');
            window.location.reload();
        });
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data?.type !== 'APP_UPDATED') return;
            const reloadKey = `serviceWorkerMessageReloaded:${APP_VERSION}`;
            if (sessionStorage.getItem(reloadKey)) return;
            sessionStorage.setItem(reloadKey, '1');
            window.location.reload();
        });
    }
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferredInstallPrompt = event;
        window.__dawaahDeferredInstallPrompt = event;
        showInstallAppButton();
        updateInstallAppBanner();
        updateInstallButtonLabels('Install App');
        if (pendingInstallClick) {
            pendingInstallClick = false;
            setTimeout(installDawaahApp, 100);
        }
    });
    window.addEventListener('appinstalled', () => {
        localStorage.setItem('dawaahAppInstalled', '1');
        hideInstallAppBanner();
    });
    wireInstallAppBanner();
}
