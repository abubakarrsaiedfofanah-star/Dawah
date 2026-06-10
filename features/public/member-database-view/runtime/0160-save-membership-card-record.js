// Runtime slice from daawah.js: saveMembershipCardRecord.
function saveMembershipCardRecord(cardRecord) {
    const localCards = readStoredObject('membershipCards', {});
    localCards[cardRecord.cardId] = cardRecord;
    localStorage.setItem('membershipCards', JSON.stringify(localCards));
    if (window.DawaahCloud?.enabled && window.DawaahCloud.hasAuthSession()) {
        window.DawaahCloud.saveMembershipCard?.(cardRecord).catch(error => {
            console.error('Membership card sync failed:', error);
            showNotification('Card is ready on this device, but cloud verification sync failed. Try again online.', 'warning');
        });
    }
}
