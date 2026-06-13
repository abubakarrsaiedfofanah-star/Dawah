// Runtime slice from admin.js: saveCloudStore.
function saveCloudStore(key, data) {
    if (!window.SupabaseBackend?.enabled) return;
    if (key === 'allMembers' && Array.isArray(data)) {
        data.forEach(member => {
            if (member?.uid) {
                window.SupabaseBackend.saveMember(member).catch(error => {
                    console.error('Supabase member update failed:', error);
                });
            }
            if (String(member?.status || '').toLowerCase() === 'active') {
                window.SupabaseBackend.saveMemberVerification?.(member).catch(error => {
                    console.error('Supabase member verification update failed:', error);
                });
            }
        });
        return;
    }
    window.SupabaseBackend.saveStore(key, data).catch(error => {
        console.error(`Supabase sync failed for ${key}:`, error);
    });
}
