// Runtime slice from daawah.js: markStudentNotificationRead.
function markStudentNotificationRead(notificationId) {
    fetch('supabase-required-endpoint?action=markNotificationRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ notification_id: notificationId })
    }).then(() => loadStudentNotifications()).catch(() => {});
}
