// Runtime slice from daawah.js: exportFinanceCsv.
function exportFinanceCsv(kind) {
    const records = kind === 'donations' ? donations : payments;
    const rows = records.map(item => ({
        date: item.date || '',
        name: item.memberName || item.donor || '',
        type: item.type || '',
        amount: item.amount || '',
        method: item.paymentMethod || '',
        reference: item.transactionRef || '',
        status: item.status || '',
        receipt: item.receiptNumber || '',
        approved_by: item.approvedBy || '',
        review_note: item.reviewNote || item.notes || '',
        proof: item.proofUrl || ''
    }));
    if (!rows.length) {
        alert('No finance records to export.');
        return;
    }
    const csv = convertToCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
