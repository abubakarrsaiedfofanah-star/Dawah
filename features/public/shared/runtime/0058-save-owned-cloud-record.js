// Runtime slice from daawah.js: saveOwnedCloudRecord.
function saveOwnedCloudRecord(collection, record, storageKey) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession() || !record) return Promise.resolve(record);
    return window.SupabaseBackend.createRecord(collection, record)
        .then(saved => {
            if (storageKey && saved?.supabaseId) {
                const items = readList(storageKey);
                const next = items.map(item => String(item.id || '') === String(record.id || '') ? { ...item, supabaseId: saved.supabaseId } : item);
                localStorage.setItem(storageKey, JSON.stringify(next));
            }
            return saved;
        })
        .catch(error => {
            console.error(`Supabase ${collection} save failed:`, error);
            showNotification('Saved on this device, but cloud sync failed. Please try again online.', 'warning');
            return record;
        });
}
