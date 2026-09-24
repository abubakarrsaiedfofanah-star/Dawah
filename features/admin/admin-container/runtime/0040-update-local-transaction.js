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
    const cloudUpdate = matchedItem?.supabaseId && window.SupabaseBackend?.enabled
        ? window.SupabaseBackend.updateRecord(storeKey, matchedItem.supabaseId, patch)
        : Promise.resolve(null);
    cloudUpdate.catch(error => {
        console.error(`Supabase ${storeKey} status update failed:`, error);
    });

    const receiptNumber = patch?.receiptNumber || matchedItem?.receiptNumber || matchedItem?.receipt_number || '';
    const shouldSaveReceipt = (patch?.status === 'Completed' && receiptNumber)
        || (patch?.status === 'Reversed' && receiptNumber);
    if (shouldSaveReceipt && matchedItem?.supabaseId && window.SupabaseBackend?.enabled) {
        const receiptData = patch?.status === 'Reversed'
            ? {
            ...matchedItem,
            ...patch,
            receiptNumber,
            status: 'Reversed'
            }
            : { ...matchedItem, ...patch, receiptNumber };
        cloudUpdate.then(() => window.SupabaseBackend.saveReceiptVerification?.(buildReceiptVerificationRecord(storeKey, receiptData))).catch(error => {
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
