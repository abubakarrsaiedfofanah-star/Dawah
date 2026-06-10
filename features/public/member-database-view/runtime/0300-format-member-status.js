// Runtime slice from daawah.js: formatMemberStatus.
function formatMemberStatus(status) {
    const value = String(status || 'Pending').toLowerCase();
    if (value === 'active') return 'Active';
    if (value === 'inactive') return 'Inactive';
    return 'Pending';
}
