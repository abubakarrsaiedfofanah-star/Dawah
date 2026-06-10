// Runtime slice from admin.js: rejectPaymentRecord.
function rejectPaymentRecord(paymentId) {
    const notes = prompt('Reason for rejecting this payment:', 'Could not verify received funds.');
    if (notes === null) return;
    fetch(`${API_URL}?action=rejectPayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, notes })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reject payment');
        showNotification('Payment rejected.', 'success');
        loadDashboardStats();
        loadDashboardDetail('payments');
    })
    .catch(error => showNotification(error.message, 'danger'));
}
