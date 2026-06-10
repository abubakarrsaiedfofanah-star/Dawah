// Runtime slice from admin.js: resolveFirebaseAdminUser.
async function resolveFirebaseAdminUser(username) {
    if (!window.DawaahCloud?.enabled || !window.DawaahCloud.hasAuthSession?.()) return null;
    const email = window.DawaahCloud.currentEmail?.() || username;
    let adminRole = await window.DawaahCloud.loadMyAdminRole?.().catch(() => null);
    if (!adminRole && String(email).toLowerCase() === 'abubakarrsaiedfofanah@gmail.com') {
        await window.DawaahCloud.saveAdminRole?.({
            username: 'iman',
            email,
            fullName: 'Imam',
            isMainAdmin: true
        }).catch(() => null);
        adminRole = await window.DawaahCloud.loadMyAdminRole?.().catch(() => null);
    }
    if (!adminRole && String(email).toLowerCase() === 'abubakarrsaiedfofanah@gmail.com') {
        adminRole = {
            uid: window.DawaahCloud.currentUid?.(),
            username: 'iman',
            email,
            fullName: 'Imam',
            role: 'admin',
            isMainAdmin: true
        };
    }
    if (!adminRole) throw new Error('This Firebase account is not registered as an admin.');
    return {
        id: window.DawaahCloud.currentUid?.() || adminRole.uid || email,
        username: adminRole.username || username || email.split('@')[0],
        email,
        fullName: adminRole.fullName || adminRole.full_name || adminRole.username || username || email,
        role: adminRole.role || 'admin',
        isMainAdmin: Boolean(adminRole.isMainAdmin),
        csrf_token: 'firebase'
    };
}
