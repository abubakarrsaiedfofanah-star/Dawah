// Runtime slice from daawah.js: recordFailedLoginAttempt.
function recordFailedLoginAttempt(message) {
    loginFailedAttempts += 1;
    recordSuspiciousActivity('failed_student_login', { message, attempts: loginFailedAttempts });

    if (loginFailedAttempts >= 3) {
        loginLockedUntil = Date.now() + 10000;
        loginFailedAttempts = 0;
        alert(`${message}\nToo many failed attempts. Please wait 10 seconds before trying again.`);
        updateLoginLockoutButton();
        return;
    }

    alert(`${message}\nAttempt ${loginFailedAttempts} of 3.`);
}
