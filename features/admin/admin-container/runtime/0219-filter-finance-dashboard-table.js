// Runtime slice from admin.js: filterFinanceDashboardTable.
function filterFinanceDashboardTable() {
    const container = document.getElementById('financeDashboardTable');
    if (!container) return;
    const rows = lastDashboardDetailRows || [];
    const query = String(document.getElementById('financeSearchInput')?.value || '').toLowerCase();
    const status = String(document.getElementById('financeStatusFilter')?.value || '');
    const month = String(document.getElementById('financeMonthFilter')?.value || '');
    const columns = ['id', 'date', 'created_at', 'name', 'student_name', 'donor', 'type', 'purpose', 'amount', 'paymentMethod', 'payment_method', 'transactionRef', 'transaction_id', 'receiptNumber', 'status', 'approvedBy', 'approvedAt', 'notes'];
    const filtered = rows.filter(row => {
        const haystack = columns.map(col => row[col] ?? '').join(' ').toLowerCase();
        const rowStatus = getFinanceStatus(row);
        const rowMonth = String(getFinanceDate(row) || '').slice(0, 7);
        return (!query || haystack.includes(query))
            && (!status || rowStatus === status)
            && (!month || rowMonth === month);
    });
    const visibleColumns = Array.from(new Set(filtered.flatMap(row => Object.keys(row || {}))));
    const columnsToRender = visibleColumns.length ? visibleColumns : Object.keys(rows[0] || {});
    const type = lastDashboardDetailType;
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <small class="text-muted">${filtered.length} record(s) shown</small>
            <small class="text-muted">Completed receipts are locked after approval.</small>
        </div>
        <div class="table-responsive">
            <table class="table table-striped table-sm">
                <thead><tr>${columnsToRender.map(col => `<th>${escapeAdminText(col.replaceAll('_', ' '))}</th>`).join('')}<th>Action</th></tr></thead>
                <tbody>
                    ${filtered.map(row => `
                        <tr>${columnsToRender.map(col => `<td>${formatCell(row[col], col)}</td>`).join('')}<td>${renderApprovalAction(type, row)}</td></tr>
                    `).join('') || `<tr><td colspan="${columnsToRender.length + 1}" class="text-center text-muted">No matching finance records.</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
}
