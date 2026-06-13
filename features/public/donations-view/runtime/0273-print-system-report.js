// Runtime slice from daawah.js: printSystemReport.
function printSystemReport(type) {
    const sourceMap = {
        students: { title: 'Students Report', rows: allMembers },
        members: { title: 'Paid Members Report', rows: getPaidMemberRecordsForReport() },
        payments: { title: 'Membership Dues Report', rows: payments },
        donations: { title: 'Donations Report', rows: donations },
        officers: { title: 'Officers Report', rows: allMembers.filter(member => String(member.role || 'student').toLowerCase() !== 'student') },
        research: { title: 'AI Research Usage Report', rows: getResearchHistory() }
    };
    const report = sourceMap[type] || sourceMap.students;
    const rows = Array.isArray(report.rows) ? report.rows : [];
    const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row || {})))).filter(key => !/password|token|photo|image|proof/i.test(key)).slice(0, 10);
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(report.title)}</title>
<style>body{font-family:Arial,sans-serif;margin:28px;color:#17323a}h1{margin-bottom:4px}.muted{color:#667085}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}th,td{border-bottom:1px solid #ddd;padding:7px;text-align:left;vertical-align:top}th{background:#f3fbf7}@media print{button{display:none}}</style>
</head><body>
<button onclick="window.print()">Print</button>
<h1>UMMA University Dawah Team</h1>
<div class="muted">${escapeHtml(report.title)} - ${new Date().toLocaleString()} - ${rows.length} record(s)</div>
<table><thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
<tbody>${rows.map(row => `<tr>${headers.map(header => `<td>${escapeHtml(String(row?.[header] ?? '').slice(0, 180))}</td>`).join('')}</tr>`).join('')}</tbody></table>
</body></html>`;
    const win = window.open('', '_blank');
    if (!win) {
        showNotification('Allow popups to print reports.', 'warning');
        return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
}
