// Runtime slice from admin.js: getExpiringMembershipCards.
function getExpiringMembershipCards(days = 60) {
    const now = Date.now();
    const limit = now + (days * 86400000);
    return getStudentRecords().filter(member => {
        const rawDate = member.membershipCardExpiresAt || member.cardExpiresAt || member.expiresAt;
        if (!rawDate) return false;
        const expiresAt = new Date(rawDate).getTime();
        return Number.isFinite(expiresAt) && expiresAt >= now && expiresAt <= limit;
    });
}
