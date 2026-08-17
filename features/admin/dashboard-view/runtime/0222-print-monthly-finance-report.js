// Runtime slice from admin.js: printMonthlyFinanceReport.
function printMonthlyFinanceReport() {
    const month = document.getElementById('financeMonthFilter')?.value || new Date().toISOString().slice(0, 7);
    const currentKind = lastDashboardDetailType === 'donations' ? 'Donation' : 'Payment';
    const sourceRows = (lastDashboardDetailRows || []).map(row => normalizeFinanceExportRow(currentKind, row));
    const rows = sourceRows.filter(row => !month || String(row.date || row.approvedAt || '').slice(0, 7) === month);
    if (!rows.length) {
        showNotification('No finance records found for the selected month.', 'warning');
        return;
    }
    const completed = rows.filter(row => row.status === 'Completed');
    const pending = rows.filter(row => row.status === 'Pending');
    const closed = rows.filter(row => ['Rejected', 'Reversed'].includes(row.status));
    const total = completed.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const html = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Monthly Finance Report</title>
    <style>
        body { font-family: Arial, sans-serif; color: #17323a; margin: 28px; }
        h1 { margin: 0 0 4px; font-size: 24px; }
        .muted { color: #667085; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
        .box { border: 1px solid #d9e5e1; padding: 12px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background: #f3fbf7; }
        @media print { button { display: none; } body { margin: 12mm; } }
    </style>
</head>
<body>
    <button onclick="window.print()">Print</button>
    <h1>UMMA University Dawah Team</h1>
    <div class="muted">Monthly Finance Report - ${escapeAdminText(month || 'All months')}</div>
    <div class="summary">
        <div class="box"><strong>${formatMoney(total)}</strong><br><span class="muted">Received</span></div>
        <div class="box"><strong>${completed.length}</strong><br><span class="muted">Completed</span></div>
        <div class="box"><strong>${pending.length}</strong><br><span class="muted">Pending</span></div>
        <div class="box"><strong>${closed.length}</strong><br><span class="muted">Rejected/Reversed</span></div>
    </div>
    <table>
        <thead><tr><th>Date</th><th>Name</th><th>Type</th><th>Amount</th><th>Status</th><th>Method</th><th>Receipt</th></tr></thead>
        <tbody>
            ${rows.map(row => `<tr><td>${escapeAdminText(row.date)}</td><td>${escapeAdminText(row.name)}</td><td>${escapeAdminText(row.type)}</td><td>${formatMoney(row.amount)}</td><td>${escapeAdminText(row.status)}</td><td>${escapeAdminText(row.method)}</td><td>${escapeAdminText(row.receiptNumber)}</td></tr>`).join('')}
        </tbody>
    </table>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (!win) {
        showNotification('Allow popups to print the monthly report.', 'warning');
        return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
}
