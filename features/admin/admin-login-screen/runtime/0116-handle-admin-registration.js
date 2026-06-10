// Runtime slice from admin.js: handleAdminRegistration.
async function handleAdminRegistration(event) {
    event.preventDefault();
    const username = document.getElementById('adminRegisterUsername').value.trim();
    const email = document.getElementById('adminRegisterEmail').value.trim().toLowerCase();
    const password = document.getElementById('adminRegisterPassword').value;
    const confirmPassword = document.getElementById('adminRegisterConfirmPassword').value;
    const button = document.getElementById('adminRegisterButton');
    const error = document.getElementById('adminLoginError');

    if (error) {
        error.textContent = '';
        error.classList.remove('active');
    }
    if (password !== confirmPassword) {
        showAdminLogin('Passwords do not match.');
        return;
    }
    if (!isStrongAdminPassword(password)) {
        showAdminLogin('Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    try {
        if (useStaticAdminApi && window.DawaahCloud?.enabled) {
            await window.DawaahCloud.registerEmail(email, password).catch(error => {
                if (/EMAIL_EXISTS/i.test(error.message || '')) {
                    return window.DawaahCloud.loginEmail(email, password);
                }
                throw error;
            });
            await window.DawaahCloud.saveAdminRole({ username, email, isMainAdmin: true });
            const firebaseAdmin = await resolveFirebaseAdminUser(username);
            await loadCloudAdminStores();
            setAdminUser(firebaseAdmin);
            showAdminPanel();
            document.getElementById('adminRegisterForm').reset();
            refreshAdminSetupUi();
            loadAllData();
            return;
        }
        const response = await fetch(`${API_URL}?action=registerAdmin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const result = await parseJsonResponse(response);

        if (!result.success || !result.data) {
            showAdminLogin(result.message || 'Could not create admin account.');
            return;
        }

        setAdminUser(result.data);
        showAdminPanel();
        document.getElementById('adminRegisterForm').reset();
        refreshAdminSetupUi();
        loadAllData();
    } catch (registerError) {
        showAdminLogin(registerError.message || 'Could not create admin account. Use the Firebase owner email for the main admin, then approve other admins inside the panel.');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-user-plus"></i> Create Admin Account';
    }
}

// Logout
