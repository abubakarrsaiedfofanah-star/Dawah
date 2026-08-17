// Runtime slice from daawah.js: configureDashboardReports.
function configureDashboardReports() {
    const buttons = document.querySelectorAll('.dashboard-report-btn');
    buttons.forEach(button => {
        const permission = button.dataset.permission;
        button.classList.toggle('d-none', Boolean(permission) && !hasPermission(permission));
    });
    const container = document.getElementById('dashboardReportButtons');
    if (container && !container.querySelector('.dashboard-report-btn:not(.d-none)')) {
        container.innerHTML = '<p class="text-muted mb-0">No printable reports are assigned to this role.</p>';
    }
}
