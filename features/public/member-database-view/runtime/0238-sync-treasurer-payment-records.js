// Runtime slice from daawah.js: syncTreasurerPaymentRecords.
function syncTreasurerPaymentRecords() {
    if (frontendOnly || !hasPermission('manage_payments')) return;
    fetch(`firestore-disabled-endpoint?action=getPaymentRecords&${authQuery()}`)
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !Array.isArray(result.data)) return;
            const remotePayments = result.data.map(row => {
                const memberName = [row.first_name, row.last_name].filter(Boolean).join(' ').trim();
                return {
                    dbPaymentId: Number(row.id),
                    memberName: memberName || row.student_id || row.email || 'Member',
                    studentId: row.student_id || '',
                    type: row.payment_type || 'Payment',
                    amount: row.amount,
                    date: row.created_at ? new Date(row.created_at.replace(' ', 'T')).toLocaleDateString() : 'Recently',
                    status: toDisplayStatus(row.status),
                    paymentMethod: row.payment_method || 'Not specified',
                    transactionRef: row.transaction_id || '',
        receiptNumber: row.receipt_number || row.transaction_id || '',
                    proofUrl: row.proof_url || '',
                    proofMethod: row.proof_url ? 'Proof link/file' : 'Reference only',
                    notes: row.notes || '',
                    approvedBy: row.approved_by || '',
                    approvedAt: row.approved_at || ''
                };
            });
            payments = mergeByDatabaseId(payments, remotePayments, 'dbPaymentId');
            localStorage.setItem('payments', JSON.stringify(payments));
            renderPaymentStatusSummary();
            renderPaymentHistory();
        })
        .catch(error => console.error('Payment records sync error:', error));
}
