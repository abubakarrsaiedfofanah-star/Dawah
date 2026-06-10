// Runtime slice from daawah.js: loadStudentNotifications.
function loadStudentNotifications() {
    const localNotifications = readStoredObject('studentLocalNotifications', [])
        .filter(item =>
            !currentUser
            || item.studentId === currentUser.studentId
            || item.studentId === currentUser.username
            || item.email === currentUser.email
        );
    if (frontendOnly || !currentUser) {
        renderStudentNotifications(localNotifications);
        return;
    }
    fetch('firestore-disabled-endpoint?action=getNotifications', { credentials: 'same-origin' })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !Array.isArray(result.data)) return;
            renderStudentNotifications([...localNotifications, ...result.data]);
        })
        .catch(() => renderStudentNotifications(localNotifications));
}
