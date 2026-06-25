// Runtime slice from officer.js: findLocalMember.
function findLocalMember(identifier) {
    const lookup = String(identifier || '').trim().toLowerCase();
    return readLocalMembers().find(member =>
        String(member.uid || '').toLowerCase() === lookup ||
        String(member.authUid || '').toLowerCase() === lookup ||
        String(member.studentId || '').toLowerCase() === lookup ||
        String(member.username || '').toLowerCase() === lookup ||
        String(member.email || '').toLowerCase() === lookup ||
        String(member.authEmail || '').toLowerCase() === lookup
    );
}
