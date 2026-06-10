// Runtime slice from daawah.js: getCompletedMembershipDuesPayment.
function getCompletedMembershipDuesPayment() {
    return payments
        .filter(payment => isMembershipDuesPayment(payment) && isCompletedStatus(payment.status))
        .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))[0] || null;
}
