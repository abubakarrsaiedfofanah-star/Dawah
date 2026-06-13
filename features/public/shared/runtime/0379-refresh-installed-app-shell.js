// Runtime slice from daawah.js: refreshInstalledAppShell.
function refreshInstalledAppShell(latestVersion, forceReload = false) {
    const reloadKey = `appVersionReloaded:${latestVersion}`;
    if (sessionStorage.getItem(reloadKey)) return Promise.resolve(false);
    sessionStorage.setItem(reloadKey, '1');

    if (typeof showNotification === 'function') {
        showNotification('App updated. Loading latest version...', 'info');
    }

    const clearCaches = 'caches' in window
        ? caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('dawaah-shell-')).map(key => caches.delete(key))))
        : Promise.resolve();

    const updateWorker = 'serviceWorker' in navigator
        ? navigator.serviceWorker.getRegistrations()
            .then(registrations => Promise.all(registrations.map(registration => registration.update().catch(() => {}))))
        : Promise.resolve();

    return Promise.all([clearCaches, updateWorker]).then(() => {
        setTimeout(() => window.location.reload(), forceReload ? 300 : 900);
        return true;
    });
}
