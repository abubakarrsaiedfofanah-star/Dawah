// Runtime slice from officer.js: mergeMemberIntoList.
function mergeMemberIntoList(members, member) {
    const list = Array.isArray(members) ? [...members] : [];
    const identities = memberIdentityKeys(member);
    if (!identities.length) return list;
    const index = list.findIndex(item =>
        memberIdentityKeys(item).some(key => identities.includes(key))
    );
    if (index >= 0) {
        list[index] = { ...list[index], ...member };
    } else {
        list.push(member);
    }
    return list;
}
