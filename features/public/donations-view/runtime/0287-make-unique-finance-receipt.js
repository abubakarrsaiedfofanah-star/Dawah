// Runtime slice from daawah.js: makeUniqueFinanceReceipt.
function makeUniqueFinanceReceipt(prefix, id) {
    const usedReceipts = new Set(payments.concat(donations).map(item => String(item.receiptNumber || '').toUpperCase()).filter(Boolean));
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const receipt = makeFinanceReceipt(prefix, `${id || Date.now()}${attempt ? '-' + attempt : ''}`);
        if (!usedReceipts.has(receipt.toUpperCase())) return receipt;
    }
    return makeFinanceReceipt(prefix, `${Date.now()}-${Math.random().toString(36).slice(2)}`);
}
