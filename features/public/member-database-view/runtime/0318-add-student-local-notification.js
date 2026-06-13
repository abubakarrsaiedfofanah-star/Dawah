// Runtime slice from daawah.js: addStudentLocalNotification.
function addStudentLocalNotification(member, title, message, type = 'info') {
    const notifications = readStoredObject('studentLocalNotifications', []);
    notifications.unshift({
        id: Date.now(),
        studentId: member?.studentId || member?.username || '',
        email: member?.email || '',
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('studentLocalNotifications', JSON.stringify(notifications.slice(0, 200)));
}
