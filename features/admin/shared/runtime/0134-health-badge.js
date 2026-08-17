// Runtime slice from admin.js: healthBadge.
function healthBadge(status) {
    const classes = {
        ok: 'success',
        warn: 'warning text-dark',
        fail: 'danger',
        checking: 'secondary'
    };
    const labels = {
        ok: 'OK',
        warn: 'Check',
        fail: 'Issue',
        checking: 'Checking'
    };
    return `<span class="badge bg-${classes[status] || classes.checking}">${labels[status] || labels.checking}</span>`;
}
