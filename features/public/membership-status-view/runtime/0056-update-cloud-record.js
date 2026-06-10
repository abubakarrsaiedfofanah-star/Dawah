// Runtime slice from daawah.js: updateCloudRecord.
function updateCloudRecord(collection, record, patch) {
    if (!window.DawaahCloud?.enabled || !window.DawaahCloud.hasAuthSession() || !record?.firebaseDocId) return Promise.resolve();
    return window.DawaahCloud.updateRecord(collection, record.firebaseDocId, patch).catch(error => {
        console.error(`Firestore ${collection} update failed:`, error);
        showNotification('Local update saved, but cloud status sync failed.', 'warning');
    });
}
