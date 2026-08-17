// Runtime slice from admin.js: makeUniqueReceiptNumber.
function makeUniqueReceiptNumber(storeKey, prefix, id) {
    const usedReceipts = new Set(readStore(storeKey)
        .map(item => String(item.receiptNumber || item.receipt_number || '').toUpperCase())
        .filter(Boolean));
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const receipt = makeReceiptNumber(prefix, `${id || Date.now()}${attempt ? '-' + attempt : ''}`);
        if (!usedReceipts.has(receipt.toUpperCase())) return receipt;
    }
    return makeReceiptNumber(prefix, `${Date.now()}-${Math.random().toString(36).slice(2)}`);
}
