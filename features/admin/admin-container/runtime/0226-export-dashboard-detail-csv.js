// Runtime slice from admin.js: exportDashboardDetailCsv.
function exportDashboardDetailCsv() {
    if (!requireMainAdminForSensitiveExport()) return;
    const rows = lastDashboardDetailRows || [];
    if (!rows.length) {
        showNotification('No records to export.', 'warning');
        return;
    }
    exportRowsToCsv(rows, lastDashboardDetailType || 'dashboard-records');
}
