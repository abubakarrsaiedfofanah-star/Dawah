// Runtime slice from admin.js: resolveAdminUser.
async function resolveAdminUser(username) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession?.()) return null;
    const email = window.SupabaseBackend.currentEmail?.() || username;
    const uid = window.SupabaseBackend.currentUid?.();
    let adminRole = await window.SupabaseBackend.loadMyAdminRole?.().catch(() => null);
    const isTruthyFlag = value => value === true || ['true', '1', 'yes'].includes(String(value || '').toLowerCase());
    if (!adminRole && uid && typeof window.SupabaseBackend.isSystemBootstrapped === 'function') {
        const bootstrapped = await window.SupabaseBackend.isSystemBootstrapped().catch(() => true);
        if (!bootstrapped) {
            const usernameFromEmail = String(email || username || 'main-admin').split('@')[0] || 'main-admin';
            await window.SupabaseBackend.saveAdminRoleForUid?.(uid, {
                uid,
                username: usernameFromEmail,
                email,
                fullName: usernameFromEmail,
                role: 'admin',
                isMainAdmin: true,
                status: 'active',
                createdAt: new Date().toISOString()
            });
            adminRole = await window.SupabaseBackend.loadMyAdminRole?.().catch(() => null);
        }
    }
    if (!adminRole && String(email).toLowerCase() === 'abubakarrsaiedfofanah@gmail.com') {
        await window.SupabaseBackend.saveAdminRole?.({
            username: 'iman',
            email,
            fullName: 'Imam',
            isMainAdmin: true
        }).catch(() => null);
        adminRole = await window.SupabaseBackend.loadMyAdminRole?.().catch(() => null);
    }
    if (!adminRole && String(email).toLowerCase() === 'abubakarrsaiedfofanah@gmail.com') {
        adminRole = {
            uid: window.SupabaseBackend.currentUid?.(),
            username: 'iman',
            email,
            fullName: 'Imam',
            role: 'admin',
            isMainAdmin: true
        };
    }
    if (!adminRole) throw new Error('This account is not registered as an admin.');
    return {
        id: window.SupabaseBackend.currentUid?.() || adminRole.uid || email,
        username: adminRole.username || username || email.split('@')[0],
        email,
        fullName: adminRole.fullName || adminRole.full_name || adminRole.username || username || email,
        role: adminRole.role || 'admin',
        isMainAdmin: isTruthyFlag(adminRole.isMainAdmin) || ['main-admin', 'main admin', 'super-admin', 'super admin'].includes(String(adminRole.role || '').toLowerCase()),
        csrf_token: 'supabase'
    };
}
