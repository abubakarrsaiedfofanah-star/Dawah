// Runtime slice from admin.js: deleteLocalAdminActivityLog.
function deleteLocalAdminActivityLog(logId, ownOnly = false) {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    const stores = ownOnly ? ['adminActivityLogs'] : ['adminActivityLogs', 'roleActivityLogs'];
    let removed = false;

    stores.forEach(storeName => {
        const logs = readStore(storeName);
        const target = logs.find(item => Number(item.id) === Number(logId));
        if (!target) return;
        if (ownOnly && Number(target.admin_id) !== Number(sessionAdmin?.id)) {
            return;
        }
        writeStore(storeName, logs.filter(item => Number(item.id) !== Number(logId)));
        removed = true;
    });

    if (!removed) {
        return {
            success: false,
            message: ownOnly ? 'You can only delete your own recent actions.' : 'Activity log not found.'
        };
    }

    return { success: true, message: 'Activity log deleted.' };
}
