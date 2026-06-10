// Runtime slice from admin.js: findFinanceTarget.
function findFinanceTarget(storeKey, id) {
    const keyNames = storeKey === 'payments'
        ? ['id', 'dbPaymentId', 'payment_id']
        : ['id', 'dbDonationId', 'donation_id'];
    return readStore(storeKey).find(item => keyNames.some(key => String(item[key] || '') === String(id))) || null;
}
