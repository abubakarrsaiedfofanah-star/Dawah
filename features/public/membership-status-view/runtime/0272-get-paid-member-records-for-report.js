// Runtime slice from daawah.js: getPaidMemberRecordsForReport.
function getPaidMemberRecordsForReport() {
    return allMembers.filter(member =>
        String(member.membershipCardPaymentStatus || member.paymentStatus || '').toLowerCase() === 'paid'
        || String(member.membershipCardRecordStatus || '').toLowerCase() === 'active'
        || payments.some(payment =>
            isMembershipDuesPayment(payment)
            && isCompletedStatus(payment.status)
            && [member.studentId, member.username, member.email].some(value =>
                value && [payment.studentId, payment.username, payment.email, payment.ownerEmail].includes(value)
            )
        )
    );
}
