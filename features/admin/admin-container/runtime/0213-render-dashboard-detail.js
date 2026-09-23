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

    if (type === 'students') {
        const canDelete = Boolean(currentAdmin?.isMainAdmin);
        container.innerHTML = `
            ${renderStudentDashboardFilters(rows)}
            <div class="d-flex flex-wrap gap-2 justify-content-end mb-3">
                <button class="btn btn-sm btn-outline-secondary" type="button" onclick="exportDashboardDetailCsv()"><i class="fas fa-file-export"></i> Export students</button>
            </div>
            <div class="student-record-grid">
                ${rows.map((row, index) => {
                    const name = row.fullName || row.full_name || row.name || row.username || row.student_id || row.studentId || 'Student';
                    const studentId = row.studentId || row.student_id || row.username || '';
                    const course = row.course || '';
                    const status = row.status || row.accountStatus || row.membershipStatus || 'Active';
                    const photo = row.profilePhoto || row.profileImage || row.photoUrl || row.avatar || '';
                    const badge = normalizeAdminText(status).includes('suspend') || normalizeAdminText(status).includes('inactive')
                        ? 'bg-secondary'
                        : normalizeAdminText(status).includes('pending')
                            ? 'bg-warning text-dark'
                            : 'bg-success';
                    return `
                        <article class="student-record-card">
                            <div class="student-record-card__identity">
                                ${photo ? `<img class="student-record-card__photo" src="${escapeAdminText(photo)}" alt="">` : '<span class="student-record-card__avatar" aria-hidden="true"><i class="fas fa-user"></i></span>'}
                                <div class="student-record-card__name-wrap">
                                    <h5>${escapeAdminText(name)}</h5>
                                    <p>${escapeAdminText(studentId ? `Student ID: ${studentId}` : 'Student account')}</p>
                                </div>
                                <span class="badge ${badge}">${escapeAdminText(status)}</span>
                            </div>
                            <div class="student-record-card__course"><span>Course</span><strong>${escapeAdminText(course || 'Not provided')}</strong></div>
                            ${canDelete ? `<button class="btn btn-sm btn-outline-danger student-record-delete" type="button" onclick="deleteDashboardStudent(${index})"><i class="fas fa-trash-can" aria-hidden="true"></i> Delete student</button>` : ''}
                        </article>
                    `;
                }).join('')}
            </div>
            ${rows.length ? '' : '<p class="text-muted mb-0">No students found.</p>'}
        `;
        filterStudentDashboardDetail();
        return;
    }

    const columns = Object.keys(rows[0]);
    const showApprovalActions = type === 'payments' || type === 'donations';
    const researchNote = type === 'research'
        ? '<div class="alert alert-info py-2">AI research logs are for monitoring system usage and academic safety. Religious rulings should still be verified by qualified scholars.</div>'
        : '';
    const dashboardFilters = `
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
                        <tr data-dashboard-row="1" data-status="${escapeAdminText(row.status || row.accountStatus || row.paymentStatus || '')}">${columns.map(col => `<td>${formatCell(row[col], col)}</td>`).join('')}${showApprovalActions ? `<td>${renderApprovalAction(type, row)}</td>` : ''}</tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    filterDashboardDetailRows();
}
