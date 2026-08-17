// Runtime slice from daawah.js: sendBrowserNotification.
function sendBrowserNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
        new Notification(title, {
            body,
            icon: 'assets/icon-192.png',
            badge: 'assets/icon-192.png'
        });
    } catch (error) {
        console.error('Browser notification failed:', error);
    }
}

window.enableBrowserNotifications = enableBrowserNotifications;
