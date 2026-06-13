// Runtime slice from admin.js: reverseFinancePatch.
function reverseFinancePatch(storeKey, id, reason) {
    return withFinanceAudit(storeKey, id, 'reversed', {
        status: 'Reversed',
        reversalReason: reason,
        reversedBy: currentFinanceActor(),
        reversedAt: new Date().toISOString()
    }, reason);
}
