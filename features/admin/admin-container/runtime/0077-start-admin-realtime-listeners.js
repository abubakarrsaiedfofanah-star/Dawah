// Runtime slice from admin.js: startAdminRealtimeListeners.
function startAdminRealtimeListeners() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession?.() || adminRealtimeUnsubscribers.length) return;
    const collections = {
        members: 'allMembers',
        payments: 'payments',
        donations: 'donations',
        welfareRequests: 'welfareRequests',
        eventRegistrations: 'registeredEvents',
        volunteerRegistrations: 'volunteerRecords'
    };
    Object.entries(collections).forEach(([collection, storeKey]) => {
        window.SupabaseBackend.watchCollection?.(collection, records => {
            localStorage.setItem(storeKey, JSON.stringify(records));
            handleAdminSharedStoreChange({ key: storeKey });
        }).then(unsubscribe => {
            adminRealtimeUnsubscribers.push(unsubscribe);
        }).catch(error => {
            console.warn(`${collection} admin realtime listener unavailable; using live refresh fallback:`, error);
        });
    });
}
