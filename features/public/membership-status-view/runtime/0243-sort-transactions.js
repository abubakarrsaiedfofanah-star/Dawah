// Runtime slice from daawah.js: sortTransactions.
function sortTransactions(records) {
    const priority = status => {
        const normalized = normalizedDisplayStatus(status);
        if (normalized.includes('pending')) return 0;
        if (normalized.includes('failed') || normalized.includes('rejected')) return 1;
        if (normalized.includes('waived') || normalized.includes('late')) return 2;
        return 3;
    };
    return [...records].sort((a, b) => priority(a.status) - priority(b.status));
}
