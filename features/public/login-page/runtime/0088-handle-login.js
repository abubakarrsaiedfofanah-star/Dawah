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

    if (frontendOnly && window.SupabaseBackend?.enabled) {
        try {
            await window.SupabaseBackend.loginEmail(username, password);
            const cloudMember = await loadSharedMemberStore();
            if (!cloudMember) {
                recordFailedLoginAttempt('Supabase login worked, but no student profile was found. Please register your student profile or contact admin.');
                return;
            }
        } catch (error) {
            const message = /invalid path specified|failed to construct|invalid url/i.test(error.message || '')
                ? 'Supabase URL is not the project API URL. In Vercel set SUPABASE_URL to https://PROJECT_REF.supabase.co, then redeploy.'
                : (error.message || 'Login failed. Use your registered email address.');
            recordFailedLoginAttempt(message);
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

    const authenticatedBySupabase = frontendOnly && window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.();
    if (!authenticatedBySupabase && user.password !== password) {
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
    loadSharedMemberStore().catch(error => {
        console.warn('Background member refresh failed after login:', error);
    });
}
