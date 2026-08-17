// Runtime slice from admin.js: getFinanceStatus.
function getFinanceStatus(row) {
    const raw = String(row.status || 'Pending').toLowerCase();
    if (raw.includes('complete') || raw.includes('approved')) return 'Completed';
    if (raw.includes('reject') || raw.includes('fail')) return 'Rejected';
    if (raw.includes('reverse')) return 'Reversed';
    return 'Pending';
}
