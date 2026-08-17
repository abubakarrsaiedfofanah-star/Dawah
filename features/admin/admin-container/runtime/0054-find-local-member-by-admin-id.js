// Runtime slice from admin.js: findLocalMemberByAdminId.
function findLocalMemberByAdminId(members = [], userId = '') {
    return members.find(member => localMemberMatchesAdminId(member, userId));
}
