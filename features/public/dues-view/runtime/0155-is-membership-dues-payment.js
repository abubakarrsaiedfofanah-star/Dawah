// Runtime slice from daawah.js: isMembershipDuesPayment.
function isMembershipDuesPayment(payment) {
    return String(payment?.type || '').toLowerCase() === 'membershipdues';
}
