// Runtime slice from daawah.js: markLocalMpesaFailed.
function markLocalMpesaFailed(checkoutRequestId, source) {
    const updateRecord = record => record.checkoutRequestId === checkoutRequestId ? { ...record, status: 'Failed' } : record;
    if (source === 'payment') {
        payments = payments.map(updateRecord);
        localStorage.setItem('payments', JSON.stringify(payments));
        renderPaymentHistory();
    } else {
        donations = donations.map(updateRecord);
        localStorage.setItem('donations', JSON.stringify(donations));
        renderDonationHistory();
    }
}
