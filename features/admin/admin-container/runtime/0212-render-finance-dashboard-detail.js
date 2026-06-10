// Runtime slice from admin.js: renderFinanceDashboardDetail.
function renderFinanceDashboardDetail(type, rows, container) {
    backfillFinanceReceiptVerifications(type, rows);
    const completedRows = rows.filter(row => getFinanceStatus(row) === 'Completed');
    const pendingRows = rows.filter(row => getFinanceStatus(row) === 'Pending');
    const rejectedRows = rows.filter(row => ['Rejected', 'Reversed'].includes(getFinanceStatus(row)));
    const completedTotal = completedRows.reduce((sum, row) => sum + getFinanceAmount(row), 0);
    const pendingTotal = pendingRows.reduce((sum, row) => sum + getFinanceAmount(row), 0);
    const problemTotal = rejectedRows.reduce((sum, row) => sum + getFinanceAmount(row), 0);

    container.innerHTML = `
        <div class="row g-2 mb-3">
            <div class="col-md-3"><div class="border rounded p-2 bg-white"><strong>${formatMoney(completedTotal)}</strong><br><small>Received</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2 bg-white"><strong>${formatMoney(pendingTotal)}</strong><br><small>Awaiting confirmation</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2 bg-white"><strong>${formatMoney(problemTotal)}</strong><br><small>Rejected or reversed</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2 bg-white"><strong>${rows.length}</strong><br><small>Total records</small></div></div>
        </div>
        <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
            <input type="search" class="form-control form-control-sm" style="max-width: 280px;" id="financeSearchInput" placeholder="Search name, ref, receipt..." oninput="filterFinanceDashboardTable()">
            <select class="form-select form-select-sm" style="max-width: 170px;" id="financeStatusFilter" onchange="filterFinanceDashboardTable()">
                <option value="">All statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Reversed">Reversed</option>
            </select>
            <select class="form-select form-select-sm" style="max-width: 170px;" id="financeMonthFilter" onchange="filterFinanceDashboardTable()">
                <option value="">All months</option>
                <option value="${new Date().toISOString().slice(0, 7)}">This month</option>
            </select>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="exportDashboardDetailCsv()"><i class="fas fa-file-export"></i> Export CSV</button>
            <button class="btn btn-sm btn-outline-primary" type="button" onclick="exportCombinedFinanceReportCsv()"><i class="fas fa-file-invoice-dollar"></i> Finance report</button>
            <button class="btn btn-sm btn-outline-success" type="button" onclick="printMonthlyFinanceReport()"><i class="fas fa-print"></i> Monthly print</button>
        </div>
        <div id="financeDashboardTable"></div>
    `;
    filterFinanceDashboardTable();
}
