// Runtime slice from admin.js: withFinanceAudit.
function withFinanceAudit(storeKey, id, action, patch = {}, reason = '') {
    const now = new Date().toISOString();
    const actor = currentFinanceActor();
    const items = readStore(storeKey);
    const keyNames = storeKey === 'payments'
        ? ['id', 'dbPaymentId', 'payment_id']
        : ['id', 'dbDonationId', 'donation_id'];
    const target = items.find(item => keyNames.some(key => String(item[key] || '') === String(id))) || {};
    const auditEntry = {
        action,
        by: actor,
        at: now,
        reason: reason || patch.notes || ''
    };
    return {
        ...patch,
        updatedBy: actor,
        updatedAt: now,
        auditTrail: [...(Array.isArray(target.auditTrail) ? target.auditTrail : []), auditEntry]
    };
}
