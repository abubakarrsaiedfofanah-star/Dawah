// Runtime slice from officer.js: handleOfficerLogin.
function showPortalWelcome(user, destination) {
    const existing = document.getElementById('portalWelcomeOverlay');
    existing?.remove();
    const overlay = document.createElement('section');
    overlay.id = 'portalWelcomeOverlay';
    overlay.className = 'portal-welcome-overlay';
    const name = String(user?.fullName || user?.name || user?.username || 'Officer').trim();
    const role = String(user?.role || 'officer').replace(/_/g, ' ');
    overlay.innerHTML = '<div class="portal-welcome-card"><img src="assets/umma-university-logo-color.png" alt="UMMA University" class="portal-welcome-logo"><p class="portal-welcome-kicker">UMMA UNIVERSITY DAWAH TEAM</p><h2></h2><p class="portal-welcome-role"></p><div class="portal-welcome-loader" aria-label="Opening your portal"></div><p class="portal-welcome-loading">Loading your dashboard…</p></div>';
    overlay.querySelector('h2').textContent = `Welcome back, ${name}!`;
    overlay.querySelector('.portal-welcome-role').textContent = `${role.replace(/\b\w/g, letter => letter.toUpperCase())} Portal is ready`;
    document.body.appendChild(overlay);
    window.setTimeout(() => { window.location.href = destination; }, 1250);
}

async function handleOfficerLogin(event) {
    event.preventDefault();
    localStorage.setItem(PORTAL_AUDIENCE_KEY, 'officer');
    clearOfficerAlert();
    const username = document.getElementById('officerLoginUsername').value.trim().toLowerCase();
    const password = document.getElementById('officerLoginPassword').value;
    const button = document.getElementById('officerLoginButton');

    if (!username || !password) {
        showOfficerAlert('Please enter your email and password.', 'warning');
        return;
    }
    if (!isEmailLoginIdentifier(username)) {
        showOfficerAlert('Please login with your registered email address only.', 'warning');
        return;
    }

    setButtonLoading(button, true, 'Logging in...');

    if (frontendOnly) {
        try {
            if (window.SupabaseBackend?.enabled) {
                await window.SupabaseBackend.loginEmail(username, password);
                await window.SupabaseBackend.ensureRealtimeAuth?.(username, password).catch(error => {
                    console.warn('Realtime auth unavailable for officer dashboard:', error);
                });
                await loadOfficerSharedMembers({ required: true });
            } else {
                await officerCloudReadyPromise;
            }
            const user = loginOfficerLocally(username, password, { authenticatedBySupabase: Boolean(window.SupabaseBackend?.enabled) });
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('currentRole', user.role);
            localStorage.setItem('DawaahAccountClearVersion', ACCOUNT_CLEAR_VERSION);
            window.location.href = 'index.html?dashboard=1';
        } catch (error) {
            const message = /invalid path specified|failed to construct|invalid url/i.test(error.message || '')
                ? 'Supabase URL is not the project API URL. In Vercel set SUPABASE_URL to https://PROJECT_REF.supabase.co, then redeploy.'
                : (error.message || 'Officer login failed.');
            showOfficerAlert(message, 'danger');
        } finally {
            setButtonLoading(button, false, '<i class="fas fa-right-to-bracket"></i> Login as Officer');
        }
        return;
    }

    fetch('supabase-required-endpoint?action=loginUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success || !result.data) {
            throw new Error(result.message || 'Invalid officer login.');
        }
        const user = result.data;
        const role = String(user.role || '').toLowerCase();
        if (!OFFICER_ROLES.includes(role)) {
            throw new Error(role === 'student'
                ? 'Student accounts login from index.html.'
                : 'Admin and sub-admin accounts login from admin.html.');
        }
        if (String(user.status || '').toLowerCase() !== 'active') {
            throw new Error('This officer account is waiting for main admin approval.');
        }
        return hydrateOfficerDashboardUser(username, user);
    })
    .then(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentRole', user.role);
        window.location.href = 'index.html';
    })
    .catch(error => {
        showOfficerAlert(error.message || 'Officer login failed.', 'danger');
    })
    .finally(() => setButtonLoading(button, false, '<i class="fas fa-right-to-bracket"></i> Login as Officer'));
}
