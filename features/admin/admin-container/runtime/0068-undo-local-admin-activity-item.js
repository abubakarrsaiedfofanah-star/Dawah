// Runtime slice from admin.js: undoLocalAdminActivityItem.
function undoLocalAdminActivityItem(logId) {
    const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
    const log = readStore('adminActivityLogs').find(item => Number(item.id) === Number(logId));
    if (!log) {
        return { success: false, message: 'Activity log not found.' };
    }
    if (Number(log.admin_id) !== Number(sessionAdmin?.id)) {
        return { success: false, message: 'You can only undo your own admin actions.' };
    }

    const religiousUndo = undoLocalReligiousActivity(log.action, log.details || {});
    if (religiousUndo) {
        logLocalAdminActivity('undoMyAdminActivityItem', {
            log_id: logId,
            undone_action: log.action
        });
        return { success: true, message: 'Your action was undone and recorded.' };
    }

    const prayerUndo = undoLocalPrayerTimes(log.action, log.details || {});
    if (prayerUndo) {
        logLocalAdminActivity('undoMyAdminActivityItem', {
            log_id: logId,
            undone_action: log.action
        });
        return { success: true, message: 'Your action was undone and recorded.' };
    }

    if (undoLocalReligiousActivity(log.action, log.details || {}) || undoLocalPrayerTimes(log.action, log.details || {})) {
        logLocalAdminActivity('deleteAdminActivityItem', {
            log_id: logId,
            opposed_admin: log.username || '',
            opposed_action: log.action
        });
        return { success: true, message: 'Item deleted and action recorded.' };
    }

    const target = getActivityTarget(log.action, log.details || {});
    if (!target) {
        return { success: false, message: 'This activity cannot be undone automatically.' };
    }

    deleteStoreItem(target.store, target.id);
    logLocalAdminActivity('undoMyAdminActivityItem', {
        log_id: logId,
        undone_action: log.action
    });
    return { success: true, message: 'Your action was undone and recorded.' };
}
