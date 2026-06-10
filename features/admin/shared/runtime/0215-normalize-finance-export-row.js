// Runtime slice from admin.js: normalizeFinanceExportRow.
function normalizeFinanceExportRow(kind, row) {
    return {
        kind,
        date: getFinanceDate(row),
        name: row.name || row.fullName || row.student_name || row.donor || row.donor_name || '',
        type: row.type || row.payment_type || row.donation_type || kind,
        purpose: row.purpose || '',
        amount: getFinanceAmount(row),
        status: getFinanceStatus(row),
        method: row.paymentMethod || row.payment_method || '',
        transactionRef: row.transactionRef || row.transaction_id || '',
        receiptNumber: row.receiptNumber || row.receipt_number || '',
        approvedBy: row.approvedBy || row.approved_by || '',
        approvedAt: row.approvedAt || row.approved_at || '',
        updatedBy: row.updatedBy || row.updated_by || '',
        updatedAt: row.updatedAt || row.updated_at || '',
        notes: row.notes || row.reversal_reason || ''
    };
}
