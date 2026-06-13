// Runtime slice from admin.js: isDashboardStudentMember.
function isDashboardStudentMember(row) {
    const rowKeys = new Set(memberIdentityKeys(row));
    if (
        isCompletedStatus(row?.membershipCardPaymentStatus)
        || isCompletedStatus(row?.paymentStatus)
        || isCompletedStatus(row?.membershipPaymentStatus)
        || normalizeAdminText(row?.membershipCardRecordStatus) === 'active'
        || normalizeAdminText(row?.membershipCardStatus).includes('ready after payment')
    ) {
        return true;
    }
    return getMemberRecords().some(member =>
        memberIdentityKeys(member).some(key => rowKeys.has(key))
    );
}
