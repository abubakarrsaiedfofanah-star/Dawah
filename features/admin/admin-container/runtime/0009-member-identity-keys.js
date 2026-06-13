// Runtime slice from admin.js: memberIdentityKeys.
function memberIdentityKeys(member) {
    return [
        member?.uid,
        member?.ownerUid,
        member?.email,
        member?.authEmail,
        member?.studentId,
        member?.student_id,
        member?.username,
        member?.memberId
    ].map(value => normalizeAdminText(value)).filter(Boolean);
}
