// Runtime slice from admin.js: getMemberRecords.
function getMemberRecords() {
    const students = getStudentRecords();
    const paidKeys = new Set(
        readStore('payments')
            .filter(payment => isMembershipDuesRecord(payment) && isCompletedStatus(payment.status))
            .flatMap(paymentIdentityKeys)
    );
    return students.filter(student => {
        const directMembership = isCompletedStatus(student.membershipCardPaymentStatus)
            || isCompletedStatus(student.paymentStatus)
            || normalizeAdminText(student.membershipCardRecordStatus) === 'active'
            || normalizeAdminText(student.membershipCardStatus).includes('ready after payment');
        return directMembership || memberIdentityKeys(student).some(key => paidKeys.has(key));
    });
}
