// Runtime slice from daawah.js: getMemberStatusBadgeClass.
function getMemberStatusBadgeClass(status) {
    const value = String(status || 'Pending').toLowerCase();
    if (value === 'active') return 'bg-success';
    if (value === 'inactive') return 'bg-secondary';
    return 'bg-warning text-dark';
}
