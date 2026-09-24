// Runtime slice from daawah.js: saveMembershipCardRecord.
function saveMembershipCardRecord(cardRecord) {
    const localCards = readStoredObject('membershipCards', {});
    localCards[cardRecord.cardId] = cardRecord;
    localStorage.setItem('membershipCards', JSON.stringify(localCards));
    if (window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession()) {
        window.__dawahCardSyncs ||= new Map();
        if (window.__dawahCardSyncs.has(cardRecord.cardId)) return window.__dawahCardSyncs.get(cardRecord.cardId);
        const savePromise = window.SupabaseBackend.saveMembershipCard?.(cardRecord).catch(error => {
            console.error('Membership card sync failed:', error);
            showNotification('Card is saved on this device, but online verification is not ready. Try again later.', 'warning');
            return null;
        }) || Promise.resolve(null);
        window.__dawahCardSyncs.set(cardRecord.cardId, savePromise);
        savePromise.finally(() => window.__dawahCardSyncs.delete(cardRecord.cardId));
        return savePromise;
    }
    return Promise.resolve(null);
}
