// Runtime slice from admin.js: filterStudentDashboardDetail.
function filterStudentDashboardDetail() {
    const search = normalizeAdminText(document.getElementById('studentDashboardSearch')?.value || '');
    const rows = Array.from(document.querySelectorAll('#dashboardDetailTable .student-record-card'));
    let visible = 0;

    rows.forEach(row => {
        const matchesSearch = !search || normalizeAdminText(row.textContent).includes(search);
        const shouldShow = matchesSearch;
        row.classList.toggle('d-none', !shouldShow);
        if (shouldShow) visible += 1;
    });

    const count = document.getElementById('studentDashboardFilterCount');
    if (count) count.textContent = `${visible} ${visible === 1 ? 'student' : 'students'}`;
}
