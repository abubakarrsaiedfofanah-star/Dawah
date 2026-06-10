// Runtime slice from daawah.js: getWelfareStatusIcon.
function getWelfareStatusIcon(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'approved' || normalized === 'completed') return 'fa-circle-check';
    if (normalized === 'rejected') return 'fa-circle-xmark';
    return 'fa-clock';
}
