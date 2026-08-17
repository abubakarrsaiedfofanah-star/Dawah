// Runtime slice from daawah.js: recordSuspiciousActivity.
function recordSuspiciousActivity(type, details = {}) {
    const log = readStoredObject('suspiciousActivityLog', []);
    log.unshift({
        id: Date.now(),
        type,
        details,
        user: currentUser?.email || currentUser?.studentId || currentUser?.username || '',
        host: location.host,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('suspiciousActivityLog', JSON.stringify(log.slice(0, 300)));
}
