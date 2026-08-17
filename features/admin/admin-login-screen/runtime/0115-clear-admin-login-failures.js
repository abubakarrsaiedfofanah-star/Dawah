// Runtime slice from admin.js: clearAdminLoginFailures.
function clearAdminLoginFailures() {
    localStorage.removeItem(ADMIN_LOGIN_FAILURE_KEY);
}
