// Runtime slice from daawah.js: normalizeFinanceReference.
function normalizeFinanceReference(reference) {
    return String(reference || '').trim().toUpperCase().replace(/\s+/g, '');
}
