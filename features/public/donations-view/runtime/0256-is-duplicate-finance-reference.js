// Runtime slice from daawah.js: isDuplicateFinanceReference.
function isDuplicateFinanceReference(reference) {
    const normalized = normalizeFinanceReference(reference);
    if (!normalized || normalized.startsWith('CASH-')) return false;
    return payments.concat(donations).some(item => normalizeFinanceReference(item.transactionRef) === normalized);
}
