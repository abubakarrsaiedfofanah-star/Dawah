// Runtime slice from admin.js: loadDashboardDetail.
function loadDashboardDetail(type) {
    setActiveDashboardCard(type);
    refreshCloudAdminStores(true)
        .finally(() => loadDashboardDetailFromLocal(type));
}
