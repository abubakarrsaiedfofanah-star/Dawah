// Runtime slice from admin.js: rejectFinancePatch.
function rejectFinancePatch(storeKey, id, reason) {
    return withFinanceAudit(storeKey, id, 'rejected', {
        status: 'Rejected',
        notes: reason || 'Rejected by finance/admin'
    }, reason);
}
