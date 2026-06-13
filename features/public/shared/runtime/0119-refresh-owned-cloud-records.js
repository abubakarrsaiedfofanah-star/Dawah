// Runtime slice from daawah.js: refreshOwnedCloudRecords.
async function refreshOwnedCloudRecords(collection, records) {
    if (!window.SupabaseBackend?.loadRecord || !Array.isArray(records) || !records.some(record => record.supabaseId)) {
        return null;
    }
    const refreshed = await Promise.all(records.map(async record => {
        if (!record.supabaseId) return record;
        return window.SupabaseBackend.loadRecord(collection, record.supabaseId)
            .then(remoteRecord => remoteRecord ? { ...record, ...remoteRecord } : record)
            .catch(error => {
                console.warn(`${collection} record live refresh skipped:`, error);
                return record;
            });
    }));
    return refreshed;
}
