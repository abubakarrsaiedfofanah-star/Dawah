// Runtime slice from daawah.js: logLocalRoleActivity.
function logLocalRoleActivity(actionName, details = {}) {
    if (!currentUser) return;
    const logs = readList('roleActivityLogs');
    logs.push({
        id: Date.now(),
        user_id: currentUser.dbUserId || currentUser.user_id || currentUser.id || 0,
        username: currentUser.username || currentUser.studentId || currentUser.email || 'Member',
        email: currentUser.email || '',
        action: actionName,
        source: 'member_dashboard',
        details: {
            role: currentRole || currentUser.role || 'student',
            username: currentUser.username || currentUser.studentId || '',
            ...details
        },
        ip_address: 'local browser',
        created_at: new Date().toISOString()
    });
    localStorage.setItem('roleActivityLogs', JSON.stringify(logs.slice(-200)));
}
