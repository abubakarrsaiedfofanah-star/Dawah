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
        if (isHostedStaticAdminPage && !window.SupabaseBackend?.enabled) {
            recordAdminLoginFailure();
            const detail = window.SupabaseBackend?.configError || 'Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel, make sure the live domain is allowed, then redeploy.';
            showAdminLogin(`Supabase is not configured for this hosted admin page. ${detail}`);
            return;
        }
        if (useStaticAdminApi && !window.SupabaseBackend?.enabled && username.includes('@') && getLocalAdminAccounts().length === 0) {
            recordAdminLoginFailure();
            const detail = window.SupabaseBackend?.configError || 'Add your Supabase Project URL and anon public key in supabase_config.js, then refresh.';
            showAdminLogin(`Supabase Auth is not connected yet. ${detail}`);
            return;
        }
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
        recordAdminLoginFailure();
        let friendlyMessage = rawMessage || 'Unable to verify admin login. Please check the server and database.';
        if (/invalid login credentials/i.test(rawMessage)) {
            friendlyMessage = 'Supabase rejected this email or password. Check the password saved for this Auth user, or send a password reset email from Supabase/Auth.';
        } else if (/invalid path specified|failed to construct|invalid url/i.test(rawMessage)) {
            friendlyMessage = 'Supabase URL is not the project API URL. In Vercel set SUPABASE_URL to https://PROJECT_REF.supabase.co, then redeploy.';
        } else if (/email not confirmed|confirm/i.test(rawMessage)) {
            friendlyMessage = 'This Supabase email is not confirmed yet. Confirm the user in Supabase Auth, then try again.';
        } else if (/not registered as an admin/i.test(rawMessage)) {
            friendlyMessage = 'Supabase login worked, but this user does not have an admin role row yet. Add this user uid to public.admin_roles as the main admin.';
        } else if (/failed to fetch|networkerror|load failed/i.test(rawMessage)) {
            friendlyMessage = 'Admin login could not reach Supabase or the hosted backend. Check your internet connection, disable blockers for this site, then refresh and try again.';
        }
        showAdminLogin(friendlyMessage);
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-lock"></i> Login to Admin Panel';
    }
}
