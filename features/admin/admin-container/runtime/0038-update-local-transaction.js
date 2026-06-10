// Runtime slice from admin.js: updateLocalTransaction.
function updateLocalTransaction(storeKey, id, patch) {
    const keyNames = storeKey === 'payments'
        ? ['id', 'dbPaymentId', 'payment_id']
        : ['id', 'dbDonationId', 'donation_id'];
    let matchedItem = null;
    const existingItem = readStore(storeKey).find(item => keyNames.some(key => String(item[key] || '') === String(id)));
    const existingStatus = String(existingItem?.status || '').toLowerCase();
    const nextStatus = String(patch?.status || '').toLowerCase();
    if (existingStatus === 'completed' && nextStatus !== 'reversed' && !currentAdmin?.isMainAdmin) {
        showNotification('Completed receipts are locked. Ask the main admin to reverse it if needed.', 'warning');
        return;
    }
    const items = readStore(storeKey).map(item => {
        const matches = keyNames.some(key => String(item[key] || '') === String(id));
        if (matches) matchedItem = item;
        return matches ? { ...item, ...patch } : item;
    });
    writeStore(storeKey, items);
    if (matchedItem?.firebaseDocId && window.DawaahCloud?.enabled) {
        window.DawaahCloud.updateRecord(storeKey, matchedItem.firebaseDocId, patch).catch(error => {
            console.error(`Firestore ${storeKey} status update failed:`, error);
        });
    }
    if (patch?.status === 'Completed' && patch?.receiptNumber && window.DawaahCloud?.enabled) {
        window.DawaahCloud.saveReceiptVerification?.(buildReceiptVerificationRecord(storeKey, { ...matchedItem, ...patch })).catch(error => {
            console.error('Receipt verification save failed:', error);
        });
    }
    if (patch?.status === 'Reversed' && (matchedItem?.receiptNumber || matchedItem?.receipt_number) && window.DawaahCloud?.enabled) {
        window.DawaahCloud.saveReceiptVerification?.(buildReceiptVerificationRecord(storeKey, {
            ...matchedItem,
            ...patch,
            receiptNumber: matchedItem.receiptNumber || matchedItem.receipt_number,
            status: 'Reversed'
        })).catch(error => {
            console.error('Receipt verification reversal update failed:', error);
        });
    }
    if (matchedItem) {
        logLocalAdminActivity('financeRecordUpdated', {
            store: storeKey,
            record_id: id,
            previous_status: matchedItem.status || '',
            next_status: patch?.status || '',
            receipt_number: patch?.receiptNumber || matchedItem.receiptNumber || matchedItem.receipt_number || ''
        });
    }
}
