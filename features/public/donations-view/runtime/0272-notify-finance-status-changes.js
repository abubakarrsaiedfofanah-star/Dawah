// Runtime slice from daawah.js: notifyFinanceStatusChanges.
function notifyFinanceStatusChanges(kind, records) {
    if (!Array.isArray(records) || !currentUser) return;
    const key = `financeStatusSeen:${kind}:${currentUser.email || currentUser.username || currentUser.studentId || 'user'}`;
    let seen = {};
    try {
        seen = readStoredObject(key, {});
    } catch (error) {
        seen = {};
    }
    let changed = false;
    records.forEach(record => {
        const id = String(record.id || record.dbPaymentId || record.dbDonationId || record.transactionRef || '');
        if (!id) return;
        const status = String(record.status || '');
        if (!status || seen[id] === status) return;
        if (seen[id] && ['Completed', 'Rejected', 'Failed', 'Reversed'].includes(status)) {
            const label = kind === 'donations' ? 'Donation' : 'Payment';
            const message = `${label} ${status.toLowerCase()}. ${status === 'Completed' ? 'Receipt is ready.' : 'Please check the details.'}`;
            showNotification(message, status === 'Completed' ? 'success' : 'warning');
            sendBrowserNotification(`UMMA ${label} Update`, message);
        }
        seen[id] = status;
        changed = true;
    });
    if (changed) localStorage.setItem(key, JSON.stringify(seen));
}
