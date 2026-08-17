// Runtime slice from admin.js: formatRequestMoney.
function formatRequestMoney(value) {
    if (value === null || value === undefined || value === '' || value === 'Not specified') {
        return 'Not specified';
    }
    if (Number.isNaN(Number(value))) {
        return escapeAdminText(String(value));
    }
    return formatMoney(value);
}
