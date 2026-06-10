// Runtime slice from daawah.js: reviewPayment.
function reviewPayment(index) {
    const payment = payments[index];
    if (!payment) return;
    const details = [
        `Name: ${payment.memberName || currentUser?.fullName || 'Student'}`,
        `Type: ${formatPaymentType(payment.type)}`,
        `Amount: KSh ${payment.amount || 0}`,
        `Method: ${payment.paymentMethod || 'Not specified'}`,
        `Reference: ${payment.transactionRef || 'Not recorded'}`,
        `Status: ${payment.status || 'Pending Approval'}`,
        `Proof: ${payment.proofUrl ? 'Attached' : 'Not attached'}`
    ].join('\n');
    const note = prompt(`${details}\n\nAdd review note, or leave blank to close review:`, payment.reviewNote || '');
    if (note === null) return;
    payments[index] = {
        ...payment,
        reviewNote: note.trim(),
        reviewedBy: getFinanceActorName(),
        reviewedAt: new Date().toISOString(),
        auditTrail: appendFinanceAudit(payment, 'reviewed', note.trim() || 'Reviewed by finance/admin')
    };
    localStorage.setItem('payments', JSON.stringify(payments));
    if (payment.firebaseDocId && window.DawaahCloud?.enabled) {
        window.DawaahCloud.updateRecord('payments', payment.firebaseDocId, {
            reviewNote: payments[index].reviewNote,
            reviewedBy: payments[index].reviewedBy,
            reviewedAt: payments[index].reviewedAt,
            auditTrail: payments[index].auditTrail || []
        }).catch(error => console.error('Firestore payment review update failed:', error));
    }
    renderPaymentHistory();
    showNotification('Payment review note saved.', 'success');
}
