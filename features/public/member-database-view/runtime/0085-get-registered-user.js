// Runtime slice from daawah.js: getRegisteredUser.
function getRegisteredUser(identifier) {
    const lookup = String(identifier || '').trim().toLowerCase();
    return allMembers.find(member =>
        String(member.uid || '').toLowerCase() === lookup ||
        String(member.authUid || '').toLowerCase() === lookup ||
        String(member.studentId || '').toLowerCase() === lookup ||
        String(member.email || '').toLowerCase() === lookup ||
        String(member.authEmail || '').toLowerCase() === lookup ||
        String(member.username || '').toLowerCase() === lookup
    );
}
