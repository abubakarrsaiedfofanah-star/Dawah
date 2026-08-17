// Runtime slice from daawah.js: savePaymentLocally.
function savePaymentLocally(payment) {
    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));
    saveOwnedCloudRecord('payments', payment, 'payments');
    const sendProof = confirm('Payment submitted. The treasurer must confirm it before a receipt is available.\n\nDo you want to send proof screenshot by WhatsApp now?');
    if (sendProof) {
        const message = `Assalamu alaikum Treasurer, payment proof for ${currentUser?.fullName || currentUser?.username || 'student'} (${currentUser?.studentId || ''}). Reference: ${payment.transactionRef}. Amount: KSh ${payment.amount}.`;
        window.open(getTreasurerWhatsappUrl(message), '_blank', 'noopener');
    }

    document.getElementById('paymentForm').reset();
    updatePaymentInstructions('payment');
    bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
    renderPaymentStatusSummary();
    loadMembershipStatus();
    updateDashboardStats();
    renderPaymentHistory();
}
