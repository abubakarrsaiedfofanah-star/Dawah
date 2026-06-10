// Runtime slice from daawah.js: handleLogin.
async function handleLogin(e) {
    e.preventDefault();

    const now = Date.now();
    if (loginLockedUntil > now) {
        const secondsLeft = Math.ceil((loginLockedUntil - now) / 1000);
        alert(`Too many failed login attempts. Please wait ${secondsLeft} seconds before trying again.`);
        return;
    }

    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        alert('Please fill in all fields.');
        return;
    }
    if (!isEmailLoginIdentifier(username)) {
        alert('Please login with your registered email address only.');
        return;
    }

    if (frontendOnly && window.DawaahCloud?.enabled) {
        try {
            await window.DawaahCloud.loginEmail(username, password);
            await window.DawaahCloud.ensureRealtimeAuth?.(username, password).catch(error => {
                console.warn('Realtime auth unavailable; using live refresh fallback:', error);
            });
            await loadSharedMemberStore();
        } catch (error) {
            recordFailedLoginAttempt(error.message || 'Login failed. Use your registered email address.');
            return;
        }
    } else {
        await cloudStoresReadyPromise;
    }

    if (!frontendOnly) {
        loginWithServerSession(username, password);
        return;
    }

    const user = getRegisteredUser(username);
    if (!user) {
        recordFailedLoginAttempt('No registered account found. Please register first.');
        return;
    }

    const authenticatedByFirebase = frontendOnly && window.DawaahCloud?.enabled && window.DawaahCloud.hasAuthSession?.();
    if (!authenticatedByFirebase && user.password !== password) {
        recordFailedLoginAttempt('Invalid password.');
        return;
    }

    if (['inactive', 'pending', 'suspended'].includes(String(user.status || 'Active').toLowerCase())) {
        recordFailedLoginAttempt('This account is pending approval or inactive. Please contact the admin.');
        return;
    }

    loginFailedAttempts = 0;
    loginLockedUntil = 0;
    currentUser = user;
    currentRole = user.role || 'student';

    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('currentRole', currentRole);

    document.getElementById('loginForm').reset();
    showDashboard();
}
