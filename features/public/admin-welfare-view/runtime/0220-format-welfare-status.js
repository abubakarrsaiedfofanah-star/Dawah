// Runtime slice from daawah.js: formatWelfareStatus.
function formatWelfareStatus(status) {
    const normalized = String(status || 'Pending Review').toLowerCase();
    if (normalized === 'approved') return 'Approved';
    if (normalized === 'rejected') return 'Rejected';
    if (normalized === 'completed') return 'Completed';
    return 'Pending Review';
}
