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
        app: "UMMA University Da'awah Team",
        backend: window.DawaahCloud?.enabled ? 'firebase-firestore' : 'browser-local',
        exportedAt: new Date().toISOString(),
        exportedBy: {
            admin: currentAdmin?.username || currentAdmin?.email || '',
            firebaseUid: window.DawaahCloud?.currentUid?.() || '',
            firebaseEmail: window.DawaahCloud?.currentEmail?.() || ''
        },
        stores
    };
}
