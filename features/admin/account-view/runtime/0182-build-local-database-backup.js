// Runtime slice from admin.js: buildLocalDatabaseBackup.
function buildLocalDatabaseBackup() {
    const storeKeys = [
        'allMembers',
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
        'contactVoiceMessages',
        'payments',
        'donations',
        'welfareRequests',
        'registeredEvents',
        'volunteerRecords'
    ];
    const stores = {};
    storeKeys.forEach(key => {
        if (key === 'adminPrayerTimes' || key === 'siteSettings' || key === 'adminReligiousActivities') {
            stores[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } else {
            stores[key] = readStore(key);
        }
    });
    return {
        app: "UMMA University Dawah Team",
        backend: window.SupabaseBackend?.enabled ? 'supabase-postgres' : 'browser-local',
        exportedAt: new Date().toISOString(),
        exportedBy: {
            admin: currentAdmin?.username || currentAdmin?.email || '',
            SupabaseUid: window.SupabaseBackend?.currentUid?.() || '',
            SupabaseEmail: window.SupabaseBackend?.currentEmail?.() || ''
        },
        stores
    };
}
