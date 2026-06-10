// Runtime slice from admin.js: filterDashboardDetailRows.
function filterDashboardDetailRows() {
    const query = normalizeAdminText(document.getElementById('dashboardDetailSearch')?.value || '');
    const status = normalizeAdminText(document.getElementById('dashboardDetailStatusFilter')?.value || '');
    const rows = Array.from(document.querySelectorAll('#dashboardDetailTable tbody tr[data-dashboard-row]'));
    let visible = 0;

    rows.forEach(row => {
        const rowStatus = normalizeAdminText(row.dataset.status || '');
        const matchesStatus = !status || rowStatus.includes(status);
        const matchesSearch = !query || normalizeAdminText(row.textContent).includes(query);
        const shouldShow = matchesStatus && matchesSearch;
        row.classList.toggle('d-none', !shouldShow);
        if (shouldShow) visible += 1;
    });

    const count = document.getElementById('dashboardDetailFilterCount');
    if (count) count.textContent = `${visible} shown`;
}
