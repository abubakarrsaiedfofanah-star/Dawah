// Runtime slice from daawah.js: showNotification.
function showNotification(message, type = 'info') {
    const notificationIcons = {
        info: 'fa-bell',
        warning: 'fa-triangle-exclamation',
        success: 'fa-circle-check',
        danger: 'fa-triangle-exclamation',
        report: 'fa-chart-line',
        users: 'fa-users',
        admins: 'fa-user-shield'
    };
    const bootstrapType = ['info', 'warning', 'success', 'danger'].includes(type) ? type : 'info';
    const icon = notificationIcons[type] || notificationIcons.info;
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${bootstrapType} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        <i class="fas ${icon} me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Role-Based Access Control
