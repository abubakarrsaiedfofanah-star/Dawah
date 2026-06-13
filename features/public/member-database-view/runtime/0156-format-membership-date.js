// Runtime slice from daawah.js: formatMembershipDate.
function formatMembershipDate(value, fallback = 'After payment') {
    if (!value) return fallback;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString();
}
