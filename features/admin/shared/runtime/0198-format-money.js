// Runtime slice from admin.js: formatMoney.
function formatMoney(value) {
    return 'KSh ' + Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}
