// Runtime slice from daawah.js: getExistingRoleHolder.
function getExistingRoleHolder(role) {
    if (!isUniqueRegistrationRole(role)) return null;
    return allMembers.find(member =>
        String(member.role || '').toLowerCase() === String(role || '').toLowerCase() &&
        !['rejected', 'suspended'].includes(String(member.status || '').toLowerCase())
    );
}
