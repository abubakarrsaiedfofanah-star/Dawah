// Runtime slice from admin.js: reversePaymentRecord.
function reversePaymentRecord(paymentId) {
    const reason = prompt('Main admin reversal reason:');
    if (!reason) return;
    fetch(`${API_URL}?action=reversePayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reverse payment');
        showNotification('Payment reversed and audited.', 'success');
        loadDashboardStats();
        loadDashboardDetail('payments');
    })
    .catch(error => showNotification(error.message, 'danger'));
}
