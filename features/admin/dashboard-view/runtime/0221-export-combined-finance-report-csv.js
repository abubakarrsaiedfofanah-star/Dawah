// Runtime slice from admin.js: exportCombinedFinanceReportCsv.
function exportCombinedFinanceReportCsv() {
    const paymentRows = readStore('payments').map(row => normalizeFinanceExportRow('Payment', row));
    const donationRows = readStore('donations').map(row => normalizeFinanceExportRow('Donation', row));
    const fallback = lastDashboardDetailRows.map(row => normalizeFinanceExportRow(lastDashboardDetailType === 'donations' ? 'Donation' : 'Payment', row));
    const rows = paymentRows.concat(donationRows);
    const reportRows = rows.length ? rows : fallback;
    if (!reportRows.length) {
        showNotification('No finance records to export.', 'warning');
        return;
    }
    exportRowsToCsv(reportRows, 'combined-finance-report', ['kind', 'date', 'name', 'type', 'purpose', 'amount', 'status', 'method', 'transactionRef', 'receiptNumber', 'approvedBy', 'approvedAt', 'updatedBy', 'updatedAt', 'notes']);
}
