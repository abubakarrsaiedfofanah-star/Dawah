// Runtime slice from admin.js: loadDashboardDetail.
function loadDashboardDetail(type) {
    setActiveDashboardCard(type);
    const detailTable = document.getElementById('dashboardDetailTable');
    if (detailTable) detailTable.innerHTML = '<div class="py-4 text-center text-muted"><i class="fas fa-spinner fa-spin"></i> Loading records...</div>';
    document.getElementById('dashboardView')?.classList.add('dashboard-detail-open');
    refreshCloudAdminStores(true)
        .finally(() => loadDashboardDetailFromLocal(type));
}

function closeDashboardDetail() {
    document.getElementById('dashboardView')?.classList.remove('dashboard-detail-open');
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDashboardDetail();
});
