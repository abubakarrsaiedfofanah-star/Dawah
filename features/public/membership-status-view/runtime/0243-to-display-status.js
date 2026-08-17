// Runtime slice from daawah.js: toDisplayStatus.
function toDisplayStatus(status) {
    const normalized = String(status || '').toLowerCase();
    const labels = {
        pending: 'Pending Approval',
        completed: 'Completed',
        failed: 'Failed',
        rejected: 'Rejected',
        late: 'Late',
        waived: 'Waived',
        pending_main_approval: 'Pending Main Approval',
        reversed: 'Reversed'
    };
    return labels[normalized] || status || 'Pending Approval';
}
