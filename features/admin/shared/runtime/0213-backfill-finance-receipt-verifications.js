// Runtime slice from admin.js: backfillFinanceReceiptVerifications.
function backfillFinanceReceiptVerifications(type, rows) {
    if (!window.DawaahCloud?.enabled || !window.DawaahCloud.hasAuthSession?.()) return;
    if (!['payments', 'donations'].includes(type) || !Array.isArray(rows)) return;
    rows
        .filter(row => getFinanceStatus(row) === 'Completed')
        .filter(row => row.receiptNumber || row.receipt_number || row.transactionRef || row.transaction_id)
        .slice(0, 75)
        .forEach(row => {
            const receiptNumber = row.receiptNumber || row.receipt_number || row.transactionRef || row.transaction_id;
            const migrationKey = `receiptVerificationBackfill:${receiptNumber}`;
            if (sessionStorage.getItem(migrationKey) === '1') return;
            const record = buildReceiptVerificationRecord(type, {
                ...row,
                receiptNumber,
                status: 'Completed'
            });
            window.DawaahCloud.saveReceiptVerification(record)
                .then(() => sessionStorage.setItem(migrationKey, '1'))
                .catch(error => console.error('Receipt verification backfill failed:', error));
        });
}
