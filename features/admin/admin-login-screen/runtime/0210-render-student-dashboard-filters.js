// Runtime slice from admin.js: renderStudentDashboardFilters.
function renderStudentDashboardFilters(rows) {
    const memberCount = rows.filter(isDashboardStudentMember).length;
    const notPaidCount = Math.max(0, rows.length - memberCount);
    return `
        <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
            <select class="form-select form-select-sm" id="studentDashboardFilter" style="max-width: 220px;" onchange="filterStudentDashboardDetail()">
                <option value="all">All students (${rows.length})</option>
                <option value="members">Paid members (${memberCount})</option>
                <option value="not_paid">Not paid yet (${notPaidCount})</option>
                <option value="pending">Pending status</option>
                <option value="active">Active login</option>
            </select>
            <input type="search" class="form-control form-control-sm" id="studentDashboardSearch" style="max-width: 260px;" placeholder="Search student records" oninput="filterStudentDashboardDetail()">
            <span class="small text-muted" id="studentDashboardFilterCount">${rows.length} shown</span>
        </div>
    `;
}
