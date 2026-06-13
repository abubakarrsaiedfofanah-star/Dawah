// Runtime slice from admin.js: handleAdminLogin.
async function handleAdminLogin(event) {
    event.preventDefault();
    const lockout = getAdminLoginLockout();
    if (lockout.locked) {
        showAdminLogin(`Too many failed attempts. Try again in ${lockout.minutes} minute(s).`);
        return;
    }
    const username = document.getElementById('adminLoginUsername').value.trim().toLowerCase();
    const password = document.getElementById('adminLoginPassword').value;
    const button = document.getElementById('adminLoginButton');
    const error = document.getElementById('adminLoginError');

    if (error) {
        error.textContent = '';
        error.classList.remove('active');
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

    try {
        if (useStaticAdminApi && window.SupabaseBackend?.enabled) {
            await window.SupabaseBackend.loginEmail(username, password);
            await window.SupabaseBackend.ensureRealtimeAuth?.(username, password).catch(error => {
                console.warn('Realtime auth unavailable for admin panel:', error);
            });
            const adminUser = await resolveAdminUser(username);
            clearAdminLoginFailures();
            setAdminUser(adminUser);
            showAdminPanel();
            document.getElementById('adminLoginForm').reset();
            startAdminSessionTimer();
            startAdminRealtimeListeners();
            loadCloudAdminStores()
                .catch(error => console.warn('Could not load cloud admin stores after login:', error))
                .finally(() => {
                    loadAllData();
                    refreshAdminRegistrationCapture();
                    setInterval(loadAllData, ADMIN_DATA_REFRESH_MS);
                    setInterval(refreshAdminRegistrationCapture, ADMIN_REGISTRATION_CAPTURE_MS);
                });
            return;
        }
        const response = await fetch(`${API_URL}?action=loginAdmin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await parseJsonResponse(response);

        if (!result.success || !result.data) {
            recordAdminLoginFailure();
            showAdminLogin(result.message || 'Invalid admin username or password.');
            return;
        }

        clearAdminLoginFailures();
        setAdminUser(result.data);
        showAdminPanel();
        document.getElementById('adminLoginForm').reset();
        startAdminSessionTimer();
        startAdminRealtimeListeners();
        loadAllData();
        refreshAdminRegistrationCapture();
        setInterval(loadAllData, ADMIN_DATA_REFRESH_MS);
        setInterval(refreshAdminRegistrationCapture, ADMIN_REGISTRATION_CAPTURE_MS);
    } catch (loginError) {
        const rawMessage = loginError.message || '';
        const friendlyMessage = /failed to fetch|networkerror|load failed/i.test(rawMessage)
            ? 'Admin login could not reach the hosted backend. Check your internet connection, turn off Brave Shields/ad blocker for this site, then refresh and try again.'
            : rawMessage || 'Unable to verify admin login. Please check the server and database.';
        showAdminLogin(friendlyMessage);
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-lock"></i> Login to Admin Panel';
    }
}
