// Runtime slice from admin.js: recordAdminLoginFailure.
function recordAdminLoginFailure() {
    const failures = getAdminLoginFailures();
    const count = Number(failures.count || 0) + 1;
    const lockedUntil = count >= ADMIN_MAX_FAILED_LOGINS ? Date.now() + ADMIN_LOGIN_LOCKOUT_MS : 0;
    localStorage.setItem(ADMIN_LOGIN_FAILURE_KEY, JSON.stringify({ count, lockedUntil }));
}
