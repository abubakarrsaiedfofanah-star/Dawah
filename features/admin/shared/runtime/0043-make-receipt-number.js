// Runtime slice from admin.js: makeReceiptNumber.
function makeReceiptNumber(prefix, id) {
    const cleanId = String(id || Date.now()).replace(/[^a-zA-Z0-9]/g, '').slice(-8);
    const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const random = (globalThis.crypto?.getRandomValues
        ? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(3))).map(value => value.toString(16).padStart(2, '0')).join('')
        : Math.random().toString(36).slice(2, 8)).toUpperCase();
    return `${prefix}-${stamp}-${cleanId}-${random}`;
}
