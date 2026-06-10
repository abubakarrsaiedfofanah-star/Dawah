// Runtime slice from daawah.js: refreshOwnedCloudRecords.
async function refreshOwnedCloudRecords(collection, records) {
    if (!window.DawaahCloud?.loadRecord || !Array.isArray(records) || !records.some(record => record.firebaseDocId)) {
        return null;
    }
    const refreshed = await Promise.all(records.map(async record => {
        if (!record.firebaseDocId) return record;
        return window.DawaahCloud.loadRecord(collection, record.firebaseDocId)
            .then(remoteRecord => remoteRecord ? { ...record, ...remoteRecord } : record)
            .catch(error => {
                console.warn(`${collection} record live refresh skipped:`, error);
                return record;
            });
    }));
    return refreshed;
}
