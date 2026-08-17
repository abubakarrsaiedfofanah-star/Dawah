// Runtime slice from daawah.js: membershipCardVerificationUrl.
function membershipCardVerificationUrl(cardId) {
    const base = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}`;
    return `${base}verify-member.html?card=${encodeURIComponent(cardId || '')}`;
}
