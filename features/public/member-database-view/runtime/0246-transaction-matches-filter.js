// Runtime slice from daawah.js: transactionMatchesFilter.
function transactionMatchesFilter(record, search, filter) {
    const status = normalizedDisplayStatus(record.status);
    const filterMatch = filter === 'all'
        || (filter === 'pending' && (status.includes('pending') || status.includes('m-pesa')))
        || (filter === 'failed' && (status.includes('failed') || status.includes('rejected') || status.includes('late')))
        || (filter === 'completed' && status.includes('completed'))
        || (filter === 'waived' && status.includes('waived'));
    if (!filterMatch) return false;

    const haystack = [
        record.memberName,
        record.donor,
        record.studentId,
        record.type,
        record.paymentMethod,
        record.transactionRef,
        record.receiptNumber,
        record.proofUrl,
        record.proofMethod,
        record.amount,
        record.status
    ].join(' ').toLowerCase();
    return !search || haystack.includes(search.toLowerCase());
}
