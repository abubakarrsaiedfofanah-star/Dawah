// Runtime slice from officer.js: findLocalMember.
function findLocalMember(identifier) {
    const lookup = String(identifier || '').trim().toLowerCase();
    return readLocalMembers().find(member =>
        String(member.studentId || '').toLowerCase() === lookup ||
        String(member.username || '').toLowerCase() === lookup ||
        String(member.email || '').toLowerCase() === lookup
    );
}
