// Runtime slice from admin.js: getAdminLoginLockout.
function getAdminLoginLockout() {
    const failures = getAdminLoginFailures();
    const now = Date.now();
    if (Number(failures.lockedUntil || 0) > now) {
        return {
            locked: true,
            minutes: Math.ceil((Number(failures.lockedUntil) - now) / 60000)
        };
    }
    return { locked: false, minutes: 0 };
}
