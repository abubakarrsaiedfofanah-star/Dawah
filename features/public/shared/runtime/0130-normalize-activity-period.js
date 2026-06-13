// Runtime slice from daawah.js: normalizeActivityPeriod.
function normalizeActivityPeriod(value = '', dateValue = '') {
    const text = String(value || '').toLowerCase();
    if (text.includes('daily')) return 'daily';
    if (text.includes('weekly')) return 'weekly';
    if (text.includes('monthly')) return 'monthly';

    const parsedDate = dateValue ? new Date(dateValue) : null;
    if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
        const daysAway = Math.ceil((parsedDate - new Date()) / (1000 * 60 * 60 * 24));
        if (daysAway <= 1) return 'daily';
        if (daysAway <= 7) return 'weekly';
    }

    return 'monthly';
}
