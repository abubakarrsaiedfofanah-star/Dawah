// Runtime slice from daawah.js: startOwnedFinanceRealtimeListeners.
function startOwnedFinanceRealtimeListeners(collection) {
    const records = collection === 'payments' ? payments : donations;
    const docIds = records.map(record => record.supabaseId).filter(Boolean);
    if (!docIds.length) return;
    window.SupabaseBackend.watchDocuments?.(collection, docIds, record => {
        const currentRecords = collection === 'payments' ? payments : donations;
        const nextRecords = currentRecords.map(item =>
            item.supabaseId === record.supabaseId ? { ...item, ...record } : item
        );
        if (collection === 'payments') {
            payments = nextRecords;
        } else {
            donations = nextRecords;
        }
        localStorage.setItem(collection, JSON.stringify(nextRecords));
        refreshActiveRoleView();
    }).then(unsubscribe => {
        roleRealtimeUnsubscribers.push(unsubscribe);
    }).catch(error => console.warn(`${collection} owned realtime listener unavailable; using live refresh fallback:`, error));
}
