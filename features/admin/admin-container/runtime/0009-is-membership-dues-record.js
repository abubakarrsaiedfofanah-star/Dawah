// Runtime slice from admin.js: isMembershipDuesRecord.
function isMembershipDuesRecord(payment) {
    const type = normalizeAdminText(payment?.type || payment?.payment_type || payment?.purpose || payment?.kind);
    return type === 'membershipdues'
        || type === 'membership dues'
        || type.includes('membership');
}
