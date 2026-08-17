// Runtime slice from daawah.js: enableBrowserNotifications.
function enableBrowserNotifications() {
    if (!('Notification' in window)) {
        showNotification('Browser notifications are not supported on this device.', 'warning');
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            localStorage.setItem('dawaahBrowserNotifications', '1');
            sendBrowserNotification('UMMA University Dawah Team', 'Browser alerts are enabled.');
            showNotification('Browser alerts enabled.', 'success');
        } else {
            showNotification('Browser alerts were not enabled.', 'warning');
        }
    });
}
