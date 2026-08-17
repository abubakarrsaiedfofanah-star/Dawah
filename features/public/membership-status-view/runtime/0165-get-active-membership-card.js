// Runtime slice from daawah.js: getActiveMembershipCard.
function getActiveMembershipCard() {
    if (!currentUser?.membershipCardId || currentUser?.membershipCardRecordStatus === 'Revoked') return null;
    return {
        cardId: currentUser.membershipCardId,
        status: currentUser.membershipCardRecordStatus || 'Active',
        issuedAt: currentUser.membershipCardIssuedAt || '',
        expiresAt: currentUser.membershipCardExpiresAt || '',
        validityYears: currentUser.membershipCardValidityYears || getMembershipValidityYears(currentUser),
        receiptNumber: currentUser.membershipCardReceiptNumber || ''
    };
}
