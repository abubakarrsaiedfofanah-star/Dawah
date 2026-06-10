// Runtime slice from admin.js: deleteLocalAdminActivityItem.
function deleteLocalAdminActivityItem(logId) {
    const log = readStore('adminActivityLogs').find(item => Number(item.id) === Number(logId));
    if (!log) {
        return { success: false, message: 'Activity log not found.' };
    }

    const details = log.details || {};
    const target = getActivityTarget(log.action, details);
    if (!target) {
        return { success: false, message: 'This activity cannot be deleted automatically.' };
    }

    deleteStoreItem(target.store, target.id);
    logLocalAdminActivity('deleteAdminActivityItem', {
        log_id: logId,
        opposed_admin: log.username || '',
        opposed_action: log.action
    });
    return { success: true, message: 'Item deleted and action recorded.' };
}
