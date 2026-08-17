// Runtime slice from daawah.js: confirmPayment.
function confirmPayment(index) {
    const note = prompt('Approval note for this payment:', 'Approved by finance/admin');
    if (note === null) return;
    updateLocalPaymentStatus(index, 'Completed', 'completed', note);
}
