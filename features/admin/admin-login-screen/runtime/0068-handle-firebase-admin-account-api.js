// Runtime slice from admin.js: handleFirebaseAdminAccountApi.
async function handleFirebaseAdminAccountApi(action, method, payload) {
    if (!window.DawaahCloud?.enabled || !window.DawaahCloud?.hasAuthSession?.()) {
        return { success: false, message: 'Admin login required.' };
    }

    if (action === 'listAdminAccounts') {
        if (!currentAdmin?.isMainAdmin) {
            return { success: false, message: 'Only the main admin can manage admin accounts.' };
        }
        const admins = await window.DawaahCloud.listAdminRoles();
        const currentUid = String(window.DawaahCloud.currentUid?.() || currentAdmin?.id || '');
        const normalizedAdmins = admins.map(admin => ({
            id: admin.uid || admin.id,
            uid: admin.uid || admin.id,
            username: admin.username || admin.fullName || admin.email || '',
            email: admin.email || '',
            status: admin.status || 'active',
            isMainAdmin: Boolean(admin.isMainAdmin),
            is_current: String(admin.uid || admin.id) === currentUid,
            created_at: admin.createdAt || admin.created_at || admin.updatedAt || ''
        })).sort((a, b) => Number(Boolean(b.isMainAdmin)) - Number(Boolean(a.isMainAdmin)) || String(a.email).localeCompare(String(b.email)));
        return {
            success: true,
            data: {
                admins: normalizedAdmins,
                admin_count: normalizedAdmins.length,
                admin_limit: ADMIN_ACCOUNT_LIMIT
            }
        };
    }

    if (action === 'createAdminAccount') {
        if (!currentAdmin?.isMainAdmin) {
            return { success: false, message: 'Only the main admin can manage admin accounts.' };
        }
        const username = String(payload.username || '').trim();
        const email = String(payload.email || '').trim().toLowerCase();
        const password = String(payload.password || '');
        if (!username || !email.includes('@')) {
            return { success: false, message: 'Enter a valid admin username and email.' };
        }
        if (!isStrongAdminPassword(password)) {
            return { success: false, message: 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.' };
        }
        const admins = await window.DawaahCloud.listAdminRoles();
        if (admins.length >= ADMIN_ACCOUNT_LIMIT) {
            return { success: false, message: `Admin limit reached (${ADMIN_ACCOUNT_LIMIT}). Remove an admin before adding another.` };
        }
        if (admins.some(admin => String(admin.email || '').toLowerCase() === email)) {
            return { success: false, message: 'This email already has admin access.' };
        }
        const authUser = await window.DawaahCloud.createSecondaryAdminAuthUser(email, password, username);
        await window.DawaahCloud.saveAdminRoleForUid(authUser.uid, {
            username,
            email,
            fullName: username,
            isMainAdmin: false,
            status: 'active',
            createdBy: currentAdmin?.id || window.DawaahCloud.currentUid?.() || '',
            createdByEmail: currentAdmin?.email || window.DawaahCloud.currentEmail?.() || '',
            createdAt: new Date().toISOString()
        });
        logLocalAdminActivity('createAdminAccount', { username, email, uid: authUser.uid });
        return { success: true, message: 'Admin account added successfully.', data: { uid: authUser.uid, email, username } };
    }

    if (action === 'deleteAdminAccount') {
        if (!currentAdmin?.isMainAdmin) {
            return { success: false, message: 'Only the main admin can manage admin accounts.' };
        }
        const adminId = String(payload.admin_id || payload.uid || '').trim();
        if (!adminId) return { success: false, message: 'Admin ID is required.' };
        if (adminId === String(window.DawaahCloud.currentUid?.() || currentAdmin?.id || '')) {
            return { success: false, message: 'You cannot remove your own admin account while logged in.' };
        }
        const admins = await window.DawaahCloud.listAdminRoles();
        const target = admins.find(admin => String(admin.uid || admin.id) === adminId);
        if (!target) return { success: false, message: 'Admin account not found.' };
        if (target.isMainAdmin) return { success: false, message: 'Main admin cannot be removed from sub-admin tools.' };
        await window.DawaahCloud.deleteAdminRole(adminId);
        logLocalAdminActivity('deleteAdminAccount', { admin_id: adminId, email: target.email || '' });
        return { success: true, message: 'Admin access removed.' };
    }

    if (action === 'changeAdminPassword') {
        const newPassword = String(payload.new_password || payload.password || '');
        if (!isStrongAdminPassword(newPassword)) {
            return { success: false, message: 'Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol.' };
        }
        await window.DawaahCloud.updateCurrentPassword(newPassword);
        logLocalAdminActivity('changeAdminPassword', { admin_id: currentAdmin?.id || window.DawaahCloud.currentUid?.() || '' });
        return { success: true, message: 'Password changed successfully.' };
    }

    if (action === 'resetAdminPassword') {
        if (!currentAdmin?.isMainAdmin) {
            return { success: false, message: 'Only the main admin can reset admin passwords.' };
        }
        const email = String(payload.email || '').trim().toLowerCase();
        if (!email.includes('@')) return { success: false, message: 'Admin email is required.' };
        await window.DawaahCloud.sendPasswordResetEmail(email);
        return { success: true, message: 'Password reset email sent to this admin.' };
    }

    return { success: false, message: 'Unsupported Firebase admin account action.' };
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async function() {
    if (useStaticAdminApi) {
        loadCloudAdminStores().catch(error => {
            console.warn('Initial cloud admin store preload failed:', error);
        });
    }
    normalizeLocalAdminAccountsOnce();
    document.getElementById('adminLoginForm')?.addEventListener('submit', handleAdminLogin);
    document.getElementById('adminRegisterForm')?.addEventListener('submit', handleAdminRegistration);
    document.getElementById('adminForgotPasswordForm')?.addEventListener('submit', handleAdminForgotPassword);
    document.getElementById('adminResetWithCodeForm')?.addEventListener('submit', handleAdminResetWithCode);
    document.getElementById('adminCreateForm')?.addEventListener('submit', handleManagedAdminCreate);
    document.getElementById('memberRoleAssignForm')?.addEventListener('submit', handleMemberRoleAssign);
    document.getElementById('memberPasswordResetForm')?.addEventListener('submit', handleMemberPasswordReset);
    document.getElementById('adminChangePasswordForm')?.addEventListener('submit', handleAdminPasswordChange);
    window.addEventListener('storage', handleAdminSharedStoreChange);
    await refreshAdminSetupUi();
    const isAuthenticated = await checkAdminAuth();
    if (isAuthenticated) {
        startAdminSessionTimer();
        await refreshCloudAdminStores(true);
        startAdminRealtimeListeners();
        loadAllData();
        setInterval(loadAllData, ADMIN_DATA_REFRESH_MS);
        setInterval(refreshAdminRegistrationCapture, ADMIN_REGISTRATION_CAPTURE_MS);
    }
});
