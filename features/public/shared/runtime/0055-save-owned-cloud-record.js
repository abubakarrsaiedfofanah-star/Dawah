// Runtime slice from daawah.js: saveOwnedCloudRecord.
function saveOwnedCloudRecord(collection, record, storageKey) {
    if (!window.DawaahCloud?.enabled || !window.DawaahCloud.hasAuthSession() || !record) return Promise.resolve(record);
    return window.DawaahCloud.createRecord(collection, record)
        .then(saved => {
            if (storageKey && saved?.firebaseDocId) {
                const items = readList(storageKey);
                const next = items.map(item => String(item.id || '') === String(record.id || '') ? { ...item, firebaseDocId: saved.firebaseDocId } : item);
                localStorage.setItem(storageKey, JSON.stringify(next));
            }
            return saved;
        })
        .catch(error => {
            console.error(`Firestore ${collection} save failed:`, error);
            showNotification('Saved on this device, but cloud sync failed. Please try again online.', 'warning');
            return record;
        });
}
