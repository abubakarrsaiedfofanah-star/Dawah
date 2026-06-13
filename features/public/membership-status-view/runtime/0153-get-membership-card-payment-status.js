// Runtime slice from daawah.js: getMembershipCardPaymentStatus.
function getMembershipCardPaymentStatus() {
    return getCompletedMembershipDuesPayment() ? 'Paid' : 'No payment';
}
