// Runtime slice from admin.js: renderStudentDashboardFilters.
function renderStudentDashboardFilters(rows) {
    return `
        <div class="student-record-toolbar">
            <label class="visually-hidden" for="studentDashboardSearch">Search students</label>
            <input type="search" class="form-control" id="studentDashboardSearch" placeholder="Search by name, student ID, or email" oninput="filterStudentDashboardDetail()">
            <span class="small text-muted" id="studentDashboardFilterCount">${rows.length} students</span>
        </div>
    `;
}
