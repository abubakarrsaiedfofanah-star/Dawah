// Runtime slice from admin.js: clearLocalAdminActivityLogs.
function clearLocalAdminActivityLogs(ownOnly = false) {
    if (!ownOnly) {
        writeStore('adminActivityLogs', []);
        writeStore('roleActivityLogs', []);
        return { success: true, message: 'All admin activity logs cleared.' };
    }

    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    writeStore(
        'adminActivityLogs',
        readStore('adminActivityLogs').filter(item => Number(item.admin_id) !== Number(sessionAdmin?.id))
    );
    return { success: true, message: 'Your recent actions were cleared.' };
}
