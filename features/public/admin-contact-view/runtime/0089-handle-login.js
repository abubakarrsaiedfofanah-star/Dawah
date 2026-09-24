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

    let cloudMember = null;
    if (frontendOnly && window.SupabaseBackend?.enabled) {
        try {
            await window.SupabaseBackend.loginEmail(username, password);
            cloudMember = await loadSharedMemberStore();
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

    const localUser = getRegisteredUser(username);
    const authenticatedBySupabase = frontendOnly && window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.();
    const user = authenticatedBySupabase && cloudMember
        ? { ...localUser, ...cloudMember, password: localUser?.password }
        : localUser;
    if (!user) {
        recordFailedLoginAttempt('No registered account found. Please register first.');
        return;
    }

    if (!authenticatedBySupabase && user.password !== password) {
        recordFailedLoginAttempt('Invalid password.');
        return;
    }

    if (['inactive', 'pending', 'suspended', 'rejected', 'disabled'].includes(String(user.status || 'Active').trim().toLowerCase())) {
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
