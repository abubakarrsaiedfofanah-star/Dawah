// Runtime slice from officer.js: memberIdentityKeys.
function memberIdentityKeys(member) {
    return [
        member?.uid,
        member?.studentId,
        member?.username,
        member?.email,
        member?.authEmail
    ].map(value => String(value || '').trim().toLowerCase()).filter(Boolean);
}
