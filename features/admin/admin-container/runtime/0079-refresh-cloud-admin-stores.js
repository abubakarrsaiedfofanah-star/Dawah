// Runtime slice from admin.js: refreshCloudAdminStores.
function refreshCloudAdminStores(force = false) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) return Promise.resolve();
    if (!force && cloudAdminStoresPromise) return cloudAdminStoresPromise;
    if (!force && cloudAdminStoresLoadedAt && Date.now() - cloudAdminStoresLoadedAt < 20000) return Promise.resolve();
    cloudAdminStoresPromise = new Promise(resolve => {
        const timeoutId = setTimeout(() => {
            console.warn('Cloud admin store refresh timed out; continuing with the latest available data.');
            resolve();
        }, 12000);
        Promise.resolve(loadCloudAdminStores()).then(
            () => {
                clearTimeout(timeoutId);
                resolve();
            },
            error => {
                clearTimeout(timeoutId);
                console.error('Cloud admin store refresh failed:', error);
                resolve();
            }
        );
    })
        .finally(() => {
            cloudAdminStoresPromise = null;
        });
    return cloudAdminStoresPromise;
}
