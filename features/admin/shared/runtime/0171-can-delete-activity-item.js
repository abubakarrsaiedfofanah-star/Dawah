// Runtime slice from admin.js: canDeleteActivityItem.
function canDeleteActivityItem(log) {
    return Boolean(getActivityTarget(log.action, log.details || {}));
}
