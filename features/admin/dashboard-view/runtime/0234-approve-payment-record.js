// Runtime slice from admin.js: approvePaymentRecord.
function approvePaymentRecord(paymentId) {
    if (!confirm('Approve this payment only after confirming the money was received. Continue?')) return;
    fetch(`${API_URL}?action=approvePayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not approve payment');
        showNotification('Payment approved. Receipt can now be issued.', 'success');
        loadDashboardStats();
        loadDashboardDetail('payments');
    })
    .catch(error => showNotification(error.message, 'danger'));
}
