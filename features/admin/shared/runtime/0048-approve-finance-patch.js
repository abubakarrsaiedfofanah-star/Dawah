// Runtime slice from admin.js: approveFinancePatch.
function approveFinancePatch(storeKey, id) {
    const prefix = storeKey === 'payments' ? 'RCP' : 'DRT';
    const patch = withFinanceAudit(storeKey, id, 'approved', {
        status: 'Completed',
        receiptNumber: makeUniqueReceiptNumber(storeKey, prefix, id),
        approvedBy: currentFinanceActor(),
        approvedAt: new Date().toISOString()
    });
    return patch;
}
