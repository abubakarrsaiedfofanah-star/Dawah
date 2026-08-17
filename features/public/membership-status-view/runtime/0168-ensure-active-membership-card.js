// Runtime slice from daawah.js: ensureActiveMembershipCard.
function ensureActiveMembershipCard(completedPayment = getCompletedMembershipDuesPayment()) {
    if (!currentUser || !completedPayment) return null;
    const activeCard = getActiveMembershipCard();
    const cardRecord = buildMembershipCardRecord(completedPayment, activeCard?.cardId || generateMembershipCardId());
    updateStoredMembershipCardState({
        membershipCardAppliedAt: currentUser.membershipCardAppliedAt || new Date().toISOString(),
        membershipCardStatus: 'Ready after payment',
        membershipCardId: cardRecord.cardId,
        membershipCardRecordStatus: 'Active',
        membershipCardIssuedAt: cardRecord.issuedAt,
        membershipCardExpiresAt: cardRecord.expiresAt,
        membershipCardValidityYears: cardRecord.validityYears,
        membershipCardPaymentId: cardRecord.paymentId,
        membershipCardReceiptNumber: cardRecord.receiptNumber
    });
    saveMembershipCardRecord(cardRecord);
    return cardRecord;
}
