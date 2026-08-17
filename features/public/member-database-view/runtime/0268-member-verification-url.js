// Runtime slice from daawah.js: memberVerificationUrl.
function memberVerificationUrl(member = currentUser) {
    const identifier = member?.studentId || member?.username || member?.email || 'member';
    const base = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}`;
    return `${base}verify-member.html?id=${encodeURIComponent(identifier)}`;
}
