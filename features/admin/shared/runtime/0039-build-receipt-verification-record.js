// Runtime slice from admin.js: buildReceiptVerificationRecord.
function buildReceiptVerificationRecord(storeKey, item = {}) {
    const isPayment = storeKey === 'payments';
    return {
        kind: isPayment ? 'Payment' : 'Donation',
        receiptNumber: item.receiptNumber || '',
        amount: Number(item.amount || 0),
        status: item.status || 'Completed',
        type: item.type || item.payment_type || item.donation_type || (isPayment ? 'Payment' : 'Donation'),
        name: item.name || item.fullName || item.student_name || item.donor || item.donor_name || 'Member',
        method: item.paymentMethod || item.payment_method || 'Not specified',
        transactionRef: item.transactionRef || item.transaction_id || '',
        approvedBy: item.approvedBy || item.approved_by || currentFinanceActor(),
        approvedAt: item.approvedAt || item.approved_at || new Date().toISOString(),
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        auditTrail: Array.isArray(item.auditTrail) ? item.auditTrail : []
    };
}
