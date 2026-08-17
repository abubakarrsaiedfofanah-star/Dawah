// Runtime slice from admin.js: getFinanceDate.
function getFinanceDate(row) {
    return row.date || row.created_at || row.createdAt || row.approved_at || row.approvedAt || '';
}
