// Runtime slice from admin.js: filterAuditLogRows.
function filterAuditLogRows() {
    const query = (document.getElementById('auditLogFilter')?.value || '').toLowerCase();
    document.querySelectorAll('#adminActivityLogList tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
}
