// Runtime slice from daawah.js: buildMembershipCardRecord.
function buildMembershipCardRecord(completedPayment, cardId = currentUser?.membershipCardId || generateMembershipCardId()) {
    const name = currentUser.fullName || currentUser.name || currentUser.username || 'Member';
    const studentId = currentUser.studentId || currentUser.username || 'Not set';
    const issuedAt = currentUser.membershipCardIssuedAt || new Date().toISOString();
    const validityYears = getMembershipValidityYears(currentUser);
    const expiresAt = currentUser.membershipCardExpiresAt || addYearsIso(issuedAt, validityYears);
    return {
        cardId,
        fullName: name,
        username: currentUser.username || studentId,
        studentId,
        email: currentUser.email || '',
        role: currentUser.role || currentRole || 'student',
        status: 'Active',
        memberStatus: formatMemberStatus(currentUser.status || 'Active'),
        course: currentUser.course || '',
        paymentStatus: 'Paid',
        paymentId: completedPayment?.id || completedPayment?.supabaseId || completedPayment?.dbPaymentId || '',
        receiptNumber: completedPayment?.receiptNumber || completedPayment?.transactionRef || '',
        issuedAt,
        expiresAt,
        validityYears,
        updatedAt: new Date().toISOString()
    };
}
