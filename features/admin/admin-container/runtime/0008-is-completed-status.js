// Runtime slice from admin.js: isCompletedStatus.
function isCompletedStatus(status) {
    return ['completed', 'complete', 'paid', 'approved', 'success', 'successful'].includes(normalizeAdminText(status));
}
