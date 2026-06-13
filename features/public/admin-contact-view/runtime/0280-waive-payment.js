// Runtime slice from daawah.js: waivePayment.
function waivePayment(index) {
    const reason = prompt('Why is this payment waived?', 'Waived by finance/admin');
    if (reason === null) return;
    updateLocalPaymentStatus(index, 'Waived', 'waived', reason);
}
