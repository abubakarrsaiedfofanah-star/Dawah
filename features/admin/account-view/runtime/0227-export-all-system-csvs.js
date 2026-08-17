// Runtime slice from admin.js: exportAllSystemCsvs.
function exportAllSystemCsvs() {
    if (!requireMainAdminForSensitiveExport()) return;
    const exports = [
        ['students', getStudentRecords()],
        ['paid-members', getMemberRecords()],
        ['payments', readStore('payments')],
        ['donations', readStore('donations')],
        ['officers-and-admins', getLocalAdminAccounts()],
        ['audit-logs', readStore('adminActivityLogs')],
        ['events', readStore('adminEvents')],
        ['welfare-requests', readStore('welfareRequests')]
    ].filter(([, rows]) => Array.isArray(rows) && rows.length);

    if (!exports.length) {
        showNotification('No system records are available to export.', 'warning');
        return;
    }

    exports.forEach(([name, rows], index) => {
        setTimeout(() => exportRowsToCsv(rows, name), index * 250);
    });
    logLocalAdminActivity('exportAllSystemCsvs', { sections: exports.map(([name]) => name) });
    showNotification(`Export started for ${exports.length} section(s). Keep these files private.`, 'success');
}
