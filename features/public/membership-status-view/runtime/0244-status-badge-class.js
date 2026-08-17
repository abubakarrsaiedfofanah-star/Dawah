// Runtime slice from daawah.js: statusBadgeClass.
function statusBadgeClass(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'completed') return 'bg-success';
    if (['failed', 'rejected', 'late', 'reversed'].includes(normalized)) return 'bg-danger';
    if (normalized === 'waived') return 'bg-secondary';
    return 'bg-warning text-dark';
}
