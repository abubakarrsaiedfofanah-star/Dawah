// Runtime slice from officer.js: handleOfficerLogin.
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
                await loadOfficerSharedMembers();
            } else {
                await officerCloudReadyPromise;
            }
            const user = loginOfficerLocally(username, password, { authenticatedBySupabase: Boolean(window.SupabaseBackend?.enabled) });
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('currentRole', user.role);
            localStorage.setItem('DawaahAccountClearVersion', '20260526-Supabase-reset-v1');
            window.location.href = 'index.html?dashboard=1';
        } catch (error) {
            showOfficerAlert(error.message || 'Officer login failed.', 'danger');
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
