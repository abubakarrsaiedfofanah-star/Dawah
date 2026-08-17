// Runtime slice from daawah.js: renderStudentNotifications.
function renderStudentNotifications(notifications) {
    const list = document.getElementById('dashboardAlertsList');
    const count = document.getElementById('dashboardAlertCount');
    if (!list) return;
    const unread = notifications.filter(item => Number(item.is_read || item.read ? 1 : 0) === 0);
    if (count) count.textContent = String(unread.length);
    if (!notifications.length) return;
    list.innerHTML = `<div class="dashboard-alert-list">${notifications.slice(0, 5).map(item => `
        <button type="button" class="dashboard-alert-item text-start w-100 border-0 bg-transparent" onclick="markStudentNotificationRead(${Number(item.id)})">
            <i class="fas ${Number(item.is_read || item.read ? 1 : 0) === 0 ? 'fa-bell' : 'fa-circle-check'}"></i>
            <span><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.message)}</small></span>
        </button>
    `).join('')}</div>`;
}
