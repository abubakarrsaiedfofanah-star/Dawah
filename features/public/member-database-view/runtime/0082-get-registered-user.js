// Runtime slice from daawah.js: getRegisteredUser.
function getRegisteredUser(identifier) {
    const lookup = String(identifier || '').trim().toLowerCase();
    return allMembers.find(member =>
        String(member.studentId || '').toLowerCase() === lookup ||
        String(member.email || '').toLowerCase() === lookup ||
        String(member.username || '').toLowerCase() === lookup
    );
}
