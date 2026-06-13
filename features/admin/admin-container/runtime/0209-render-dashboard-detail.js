// Runtime slice from admin.js: renderDashboardDetail.
function renderDashboardDetail(type, rows) {
    const title = document.getElementById('dashboardDetailTitle');
    const container = document.getElementById('dashboardDetailTable');
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    title.innerHTML = `<i class="fas fa-table"></i> ${label} Records`;
    lastDashboardDetailType = type;
    lastDashboardDetailRows = Array.isArray(rows) ? rows : [];

    if (!rows.length && (type === 'payments' || type === 'donations')) {
        renderFinanceDashboardDetail(type, [], container);
        return;
    }

    if (!rows.length) {
        container.innerHTML = `
            <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
                <p class="text-muted mb-0">No records found in the database for this section.</p>
                <button class="btn btn-sm btn-outline-secondary" type="button" disabled><i class="fas fa-file-export"></i> Export CSV</button>
            </div>
        `;
        return;
    }

    if (type === 'research') {
        renderResearchUsageDashboard(rows, container);
        return;
    }

    if (type === 'payments' || type === 'donations') {
        renderFinanceDashboardDetail(type, rows, container);
        return;
    }

    const columns = Object.keys(rows[0]);
    const showApprovalActions = type === 'payments' || type === 'donations';
    const researchNote = type === 'research'
        ? '<div class="alert alert-info py-2">AI research logs are for monitoring system usage and academic safety. Religious rulings should still be verified by qualified scholars.</div>'
        : '';
    const studentFilters = type === 'students' ? renderStudentDashboardFilters(rows) : '';
    const dashboardFilters = type === 'students' ? '' : `
        <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
            <input type="search" class="form-control form-control-sm" id="dashboardDetailSearch" style="max-width: 280px;" placeholder="Search records" oninput="filterDashboardDetailRows()">
            <select class="form-select form-select-sm" id="dashboardDetailStatusFilter" style="max-width: 180px;" onchange="filterDashboardDetailRows()">
                <option value="">All statuses</option>
                <option value="pending">Pending only</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
            </select>
            <span class="small text-muted" id="dashboardDetailFilterCount">${rows.length} shown</span>
        </div>
    `;
    container.innerHTML = `
        ${researchNote}
        ${studentFilters}
        ${dashboardFilters}
        <div class="d-flex flex-wrap gap-2 justify-content-end mb-2">
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="exportDashboardDetailCsv()"><i class="fas fa-file-export"></i> Export CSV</button>
            <button class="btn btn-sm btn-outline-primary" type="button" onclick="exportAllSystemCsvs()"><i class="fas fa-download"></i> Export all</button>
        </div>
        <div class="table-responsive">
            <table class="table table-striped table-sm">
                <thead><tr>${columns.map(col => `<th>${col.replaceAll('_', ' ')}</th>`).join('')}${showApprovalActions ? '<th>Action</th>' : ''}</tr></thead>
                <tbody>
                    ${rows.map(row => `
                        <tr${type === 'students' ? ` data-student-filter="${getStudentDashboardFilterFlags(row).join(' ')}"` : ` data-dashboard-row="1" data-status="${escapeAdminText(row.status || row.accountStatus || row.paymentStatus || '')}"`}>${columns.map(col => `<td>${formatCell(row[col], col)}</td>`).join('')}${showApprovalActions ? `<td>${renderApprovalAction(type, row)}</td>` : ''}</tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    if (type === 'students') {
        filterStudentDashboardDetail();
    } else {
        filterDashboardDetailRows();
    }
}
