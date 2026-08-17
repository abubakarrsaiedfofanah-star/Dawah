// Runtime slice from admin.js: buildCloudDatabaseBackup.
async function buildCloudDatabaseBackup() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) {
        return buildLocalDatabaseBackup();
    }
    await loadCloudAdminStores();
    const backup = buildLocalDatabaseBackup();
    const cloudStores = await window.SupabaseBackend.loadStores([
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
        'adminPrayerTimes',
        'adminReligiousActivities',
        'siteSettings',
        'volunteerOpportunities',
        'contactVoiceMessages'
    ]).catch(() => ({}));
    Object.entries(cloudStores).forEach(([key, value]) => {
        backup.stores[key] = value;
    });
    const members = await window.SupabaseBackend.listMembers().catch(() => null);
    if (Array.isArray(members)) backup.stores.allMembers = members;
    const collections = {
        payments: 'payments',
        donations: 'donations',
        welfareRequests: 'welfareRequests',
        eventRegistrations: 'registeredEvents',
        volunteerRegistrations: 'volunteerRecords',
        auditLogs: 'cloudAuditLogs',
        receiptVerifications: 'receiptVerifications',
        memberVerifications: 'memberVerifications'
    };
    for (const [collection, key] of Object.entries(collections)) {
        const records = await window.SupabaseBackend.listRecords(collection).catch(() => null);
        if (Array.isArray(records)) backup.stores[key] = records;
    }
    backup.backend = 'supabase-postgres';
    backup.SupabaseCollections = Object.fromEntries(Object.entries(collections).map(([collection, key]) => [collection, backup.stores[key] || []]));
    return backup;
}
