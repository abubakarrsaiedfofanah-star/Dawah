// Runtime slice from daawah.js: updateLocalPaymentStatus.
function updateLocalPaymentStatus(index, displayStatus, dbStatus, note = '') {
    const payment = payments[index];
    if (!payment) return;
    if (payment.status === 'Completed' && displayStatus !== 'Completed') {
        showNotification('Completed receipts are locked. Ask the main admin to reverse it if needed.', 'warning');
        return;
    }
    const isCompleted = displayStatus === 'Completed';
    const now = new Date().toISOString();
    payments[index] = {
        ...payment,
        status: displayStatus,
        receiptNumber: isCompleted ? (payment.receiptNumber || makeUniqueFinanceReceipt('RCP', payment.id || payment.dbPaymentId)) : payment.receiptNumber,
        approvedBy: isCompleted ? getFinanceActorName() : payment.approvedBy,
        approvedAt: isCompleted ? now : payment.approvedAt,
        updatedBy: getFinanceActorName(),
        updatedAt: now,
        reviewNote: note || payment.reviewNote || '',
        auditTrail: appendFinanceAudit(payment, displayStatus.toLowerCase(), note || `Marked ${displayStatus.toLowerCase()} by ${currentRole || 'treasurer'}`)
    };
    localStorage.setItem('payments', JSON.stringify(payments));
    if (isCompleted && isMembershipDuesPayment(payments[index]) && currentUser?.membershipCardAppliedAt) {
        ensureActiveMembershipCard(payments[index]);
    }
    if (payment.supabaseId && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.updateRecord('payments', payment.supabaseId, {
            status: payments[index].status,
            receiptNumber: payments[index].receiptNumber || '',
            approvedBy: payments[index].approvedBy || '',
            approvedAt: payments[index].approvedAt || '',
            updatedBy: payments[index].updatedBy || '',
            updatedAt: payments[index].updatedAt || '',
            reviewNote: payments[index].reviewNote || '',
            auditTrail: payments[index].auditTrail || []
        }).catch(error => console.error('Supabase payment status update failed:', error));
    }
    if (isCompleted && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.saveReceiptVerification?.(buildReceiptVerificationPayload('Payment', payments[index])).catch(error => {
            console.error('Receipt verification save failed:', error);
        });
    }
    renderPaymentHistory();
    renderPaymentStatusSummary();
    loadMembershipStatus();
    updateDashboardStats();

    if (!frontendOnly && payment.dbPaymentId) {
        fetch('supabase-required-endpoint?action=updatePaymentStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authPayload({
                payment_id: payment.dbPaymentId,
                status: dbStatus,
                transaction_id: payments[index].receiptNumber,
                notes: note || `Marked ${displayStatus.toLowerCase()} by ${currentRole || 'treasurer'}`
            }))
        }).catch(error => console.error('Payment status update error:', error));
    }
    showNotification(`Payment ${displayStatus.toLowerCase()}.`, 'success');
}
