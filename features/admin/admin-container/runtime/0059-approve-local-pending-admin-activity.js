// Runtime slice from admin.js: approveLocalPendingAdminActivity.
function approveLocalPendingAdminActivity(logId) {
    const log = readStore('adminActivityLogs').find(item => Number(item.id) === Number(logId));
    if (!log || log.action !== 'pendingAdminApproval') {
        return { success: false, message: 'Pending approval item not found.' };
    }
    const details = log.details || {};
    const requestedAction = details.requested_action;
    const request = details.request || {};
    const result = runApprovedLocalAction(requestedAction, request);
    if (!result.success) return result;
    logLocalAdminActivity('approvePendingAdminActivity', {
        log_id: logId,
        approved_admin: log.username || '',
        approved_action: requestedAction,
        result: result.data || {}
    });
    return { success: true, message: 'Pending action approved and applied', data: result.data || {} };
}
