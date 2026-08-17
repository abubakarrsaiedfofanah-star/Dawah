// Runtime slice from daawah.js: renderWelfareReportRows.
function renderWelfareReportRows() {
    const body = document.getElementById('welfareReportRows');
    if (!body) return;
    const labels = {
        medical: 'Medical Support',
        financial: 'Financial Assistance',
        accommodation: 'Accommodation Support',
        counseling: 'Counseling / Guidance',
        emergency: 'Emergency Support',
        other: 'Other Support'
    };
    const rows = {};
    welfareRequests.forEach(request => {
        const key = String(request.type || request.request_type || 'other').toLowerCase();
        const status = String(request.status || 'pending').toLowerCase();
        if (!rows[key]) {
            rows[key] = { label: labels[key] || formatReportLabel(key), total: 0, approved: 0, pending: 0, rejected: 0 };
        }
        rows[key].total += 1;
        if (['approved', 'completed', 'resolved'].includes(status)) rows[key].approved += 1;
        else if (['rejected', 'declined'].includes(status)) rows[key].rejected += 1;
        else rows[key].pending += 1;
    });
    const values = Object.values(rows);
    if (!values.length) {
        body.innerHTML = '<tr><td colspan="5" class="text-muted text-center">No welfare requests have been recorded yet.</td></tr>';
        return;
    }
    body.innerHTML = values.map(row => `
        <tr>
            <td>${escapeHtml(row.label)}</td>
            <td>${row.total}</td>
            <td>${row.approved}</td>
            <td>${row.pending}</td>
            <td>${row.rejected}</td>
        </tr>
    `).join('');
}
