// Runtime slice from admin.js: refreshCloudAdminStores.
function refreshCloudAdminStores(force = false) {
    if (!window.DawaahCloud?.enabled || !window.DawaahCloud.hasAuthSession()) return Promise.resolve();
    if (!force && cloudAdminStoresPromise) return cloudAdminStoresPromise;
    if (!force && cloudAdminStoresLoadedAt && Date.now() - cloudAdminStoresLoadedAt < 20000) return Promise.resolve();
    cloudAdminStoresPromise = loadCloudAdminStores()
        .catch(error => {
            console.error('Cloud admin store refresh failed:', error);
        })
        .finally(() => {
            cloudAdminStoresPromise = null;
        });
    return cloudAdminStoresPromise;
}
