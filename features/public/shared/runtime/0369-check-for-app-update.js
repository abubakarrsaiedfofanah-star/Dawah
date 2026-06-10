// Runtime slice from daawah.js: checkForAppUpdate.
function checkForAppUpdate(forceReload = false) {
    if (location.protocol === 'file:') return Promise.resolve(false);
    return fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' })
        .then(response => parseJsonResponse(response))
        .then(versionInfo => {
            const latestVersion = String(versionInfo.version || APP_VERSION);
            const storedVersion = localStorage.getItem('ummaAppVersion');
            localStorage.setItem('ummaAppVersion', latestVersion);

            if (!storedVersion || storedVersion === latestVersion) {
                return false;
            }

            showAppUpdateNotice(versionInfo);
            return refreshInstalledAppShell(latestVersion, forceReload);
        })
        .catch(() => false);
}
