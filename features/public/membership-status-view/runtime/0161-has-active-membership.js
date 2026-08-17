// Runtime slice from daawah.js: hasActiveMembership.
function hasActiveMembership() {
    return Boolean(getCompletedMembershipDuesPayment())
        || String(currentUser?.membershipCardPaymentStatus || '').toLowerCase() === 'paid'
        || String(currentUser?.membershipCardRecordStatus || '').toLowerCase() === 'active';
}
