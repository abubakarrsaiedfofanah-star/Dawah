// Runtime slice from daawah.js: applyForMembershipCard.
function applyForMembershipCard() {
    if (!currentUser) return;
    const completedMembershipPayment = getCompletedMembershipDuesPayment();
    const cardRecord = completedMembershipPayment ? ensureActiveMembershipCard(completedMembershipPayment) : null;
    updateStoredMembershipCardState({
        membershipCardAppliedAt: currentUser.membershipCardAppliedAt || new Date().toISOString(),
        membershipCardStatus: completedMembershipPayment ? 'Ready after payment' : 'Applied - awaiting payment',
        membershipCardId: cardRecord?.cardId || currentUser.membershipCardId || '',
        membershipCardRecordStatus: cardRecord?.status || currentUser.membershipCardRecordStatus || '',
        membershipCardIssuedAt: cardRecord?.issuedAt || currentUser.membershipCardIssuedAt || '',
        membershipCardExpiresAt: cardRecord?.expiresAt || currentUser.membershipCardExpiresAt || '',
        membershipCardValidityYears: cardRecord?.validityYears || currentUser.membershipCardValidityYears || getMembershipValidityYears(currentUser),
        membershipCardPaymentId: completedMembershipPayment?.id || completedMembershipPayment?.firebaseDocId || '',
        membershipCardReceiptNumber: completedMembershipPayment?.receiptNumber || completedMembershipPayment?.transactionRef || ''
    });
    loadMembershipStatus();
    updateDashboardStats();
    showNotification(
        completedMembershipPayment
            ? 'Membership card application saved. Payment status: Paid.'
            : 'Membership card application saved. Payment status: No payment.',
        completedMembershipPayment ? 'success' : 'warning'
    );
}
