// Runtime slice from daawah.js: markLocalMpesaCompleted.
function markLocalMpesaCompleted(checkoutRequestId, source, receiptNumber) {
    const updateRecord = record => record.checkoutRequestId === checkoutRequestId
        ? { ...record, status: 'Completed', receiptNumber: receiptNumber || ('MPESA-' + Date.now()), transactionRef: receiptNumber || checkoutRequestId }
        : record;

    if (source === 'payment') {
        payments = payments.map(updateRecord);
        localStorage.setItem('payments', JSON.stringify(payments));
        if (getCompletedMembershipDuesPayment()) {
            if (currentUser?.membershipCardAppliedAt) {
                ensureActiveMembershipCard();
            } else {
                updateStoredMembershipCardState({
                    membershipCardStatus: currentUser?.membershipCardStatus || ''
                });
            }
        }
        renderPaymentStatusSummary();
        loadMembershipStatus();
        updateDashboardStats();
        renderPaymentHistory();
    } else {
        donations = donations.map(updateRecord);
        localStorage.setItem('donations', JSON.stringify(donations));
        renderDonationHistory();
    }
}
