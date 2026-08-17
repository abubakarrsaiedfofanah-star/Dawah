// Runtime slice from daawah.js: appendFinanceAudit.
function appendFinanceAudit(record, action, note = '') {
    return [
        ...(Array.isArray(record.auditTrail) ? record.auditTrail : []),
        {
            action,
            by: getFinanceActorName(),
            at: new Date().toISOString(),
            note
        }
    ];
}
