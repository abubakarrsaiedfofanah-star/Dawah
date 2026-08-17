// Runtime slice from admin.js: getAdminLoginFailures.
function getAdminLoginFailures() {
    return JSON.parse(localStorage.getItem(ADMIN_LOGIN_FAILURE_KEY) || '{"count":0,"lockedUntil":0}');
}
