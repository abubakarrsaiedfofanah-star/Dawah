// Runtime slice from admin.js: resolveAdminUser.
async function resolveAdminUser(username) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession?.()) return null;
    const email = window.SupabaseBackend.currentEmail?.() || username;
    let adminRole = await window.SupabaseBackend.loadMyAdminRole?.().catch(() => null);
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
        isMainAdmin: Boolean(adminRole.isMainAdmin),
        csrf_token: 'supabase'
    };
}
