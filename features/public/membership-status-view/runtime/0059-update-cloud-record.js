// Runtime slice from daawah.js: updateCloudRecord.
function updateCloudRecord(collection, record, patch) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession() || !record?.supabaseId) return Promise.resolve();
    return window.SupabaseBackend.updateRecord(collection, record.supabaseId, patch).catch(error => {
        console.error(`Supabase ${collection} update failed:`, error);
        showNotification('Local update saved, but cloud status sync failed.', 'warning');
    });
}
