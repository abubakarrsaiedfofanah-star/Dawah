// Runtime slice from admin.js: filterStudentDashboardDetail.
function filterStudentDashboardDetail() {
    const filter = document.getElementById('studentDashboardFilter')?.value || 'all';
    const search = normalizeAdminText(document.getElementById('studentDashboardSearch')?.value || '');
    const rows = Array.from(document.querySelectorAll('#dashboardDetailTable tbody tr[data-student-filter]'));
    let visible = 0;

    rows.forEach(row => {
        const flags = String(row.dataset.studentFilter || '').split(/\s+/);
        const matchesFilter = filter === 'all' || flags.includes(filter);
        const matchesSearch = !search || normalizeAdminText(row.textContent).includes(search);
        const shouldShow = matchesFilter && matchesSearch;
        row.classList.toggle('d-none', !shouldShow);
        if (shouldShow) visible += 1;
    });

    const count = document.getElementById('studentDashboardFilterCount');
    if (count) count.textContent = `${visible} shown`;
}
