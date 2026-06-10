// Runtime slice from daawah.js: rejectPayment.
function rejectPayment(index) {
    const reason = prompt('Why is this payment rejected? This reason is kept in the audit trail.', 'Rejected by finance/admin');
    if (reason === null) return;
    updateLocalPaymentStatus(index, 'Rejected', 'rejected', reason);
}
