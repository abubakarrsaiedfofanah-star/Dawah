// Runtime slice from admin.js: validateFinanceApproval.
function validateFinanceApproval(storeKey, id) {
    const target = findFinanceTarget(storeKey, id);
    if (!target) return `${storeKey === 'payments' ? 'Payment' : 'Donation'} record was not found.`;
    if (Number(target.amount || 0) <= 0) return 'Amount must be greater than zero before approval.';
    const method = String(target.paymentMethod || target.payment_method || target.method || '').trim();
    if (!method) return 'Payment method is required before approval.';
    const status = String(target.status || '').toLowerCase();
    if (['completed', 'reversed'].includes(status)) return 'This record is already locked. Main admin must reverse it first if correction is needed.';
    const reference = String(target.transactionRef || target.transaction_id || target.mpesaReceipt || target.mpesa_receipt || '').trim();
    const hasProof = Boolean(target.proofUrl || target.proof_url || target.paymentProof || target.payment_proof);
    if (!/cash/i.test(method) && !reference && !hasProof) {
        return 'A transaction reference or payment proof is required for non-cash approval.';
    }
    return '';
}
