// Runtime slice from daawah.js: verifyFinanceReceipt.
function verifyFinanceReceipt(kind, index) {
    const record = kind === 'donations' ? donations[index] : payments[index];
    const receipt = record?.receiptNumber || record?.transactionRef;
    if (!receipt) {
        showNotification('No receipt number is available yet.', 'warning');
        return;
    }
    window.open(`verify-receipt.html?receipt=${encodeURIComponent(receipt)}`, '_blank', 'noopener');
}

// DONATIONS
