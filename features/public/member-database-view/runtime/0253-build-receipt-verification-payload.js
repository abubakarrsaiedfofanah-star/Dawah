// Runtime slice from daawah.js: buildReceiptVerificationPayload.
function buildReceiptVerificationPayload(kind, record) {
    return {
        kind,
        receiptNumber: record.receiptNumber || '',
        amount: Number(record.amount || 0),
        status: record.status || 'Completed',
        type: record.type || kind,
        name: kind === 'Donation'
            ? (record.donor || currentUser?.fullName || currentUser?.name || currentUser?.username || 'Donor')
            : (currentUser?.fullName || currentUser?.name || currentUser?.username || 'Member'),
        method: record.paymentMethod || 'Not specified',
        transactionRef: record.transactionRef || '',
        approvedBy: record.approvedBy || getFinanceActorName(),
        approvedAt: record.approvedAt || new Date().toISOString(),
        createdAt: record.createdAt || record.date || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        auditTrail: Array.isArray(record.auditTrail) ? record.auditTrail : []
    };
}
