// Runtime slice from admin.js: getFinanceAmount.
function getFinanceAmount(row) {
    return Number(String(row.amount || row.total_amount || '0').replace(/[^0-9.-]/g, '')) || 0;
}
