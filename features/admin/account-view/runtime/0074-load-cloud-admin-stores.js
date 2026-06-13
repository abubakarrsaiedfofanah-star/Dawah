// Runtime slice from admin.js: loadCloudAdminStores.
async function loadCloudAdminStores() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) return;
    const members = await window.SupabaseBackend.listMembers().catch(() => null);
    if (Array.isArray(members)) {
        localStorage.setItem('allMembers', JSON.stringify(members));
        members
            .filter(member => String(member.status || '').toLowerCase() === 'active')
            .slice(0, 150)
            .forEach(member => {
                window.SupabaseBackend.saveMemberVerification?.(member).catch(error => {
                    console.error('Member verification backfill failed:', error);
                });
            });
    }
    const stores = await window.SupabaseBackend.loadStores([
        LOCAL_ADMIN_ACCOUNTS_KEY,
        'adminActivityLogs',
        ADMIN_NOTIFICATION_LOG_KEY,
        'roleActivityLogs',
        'adminAnnouncements',
        'adminEvents',
        'publicLeaders',
        'galleryItems',
        'adminHadiths',
        'adminResources',
        'welfareRequests',
        'payments',
        'donations'
    ]).catch(() => ({}));
    Object.entries(stores).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
    });
    const collectionMap = {
        payments: 'payments',
        donations: 'donations',
        welfareRequests: 'welfareRequests',
        eventRegistrations: 'registeredEvents',
        volunteerRegistrations: 'volunteerRecords'
    };
    await Promise.all(Object.entries(collectionMap).map(async ([collection, key]) => {
        const records = await window.SupabaseBackend.listRecords(collection).catch(() => null);
        if (Array.isArray(records)) {
            localStorage.setItem(key, JSON.stringify(records));
        }
    }));
    cloudAdminStoresLoadedAt = Date.now();
}
