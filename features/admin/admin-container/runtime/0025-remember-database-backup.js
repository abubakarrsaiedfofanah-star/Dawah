// Runtime slice from admin.js: rememberDatabaseBackup.
function rememberDatabaseBackup(filename) {
    const metadata = {
        filename,
        downloadedAt: new Date().toISOString(),
        admin: currentAdmin?.username || currentAdmin?.email || '',
        firebaseUid: window.DawaahCloud?.currentUid?.() || '',
        firebaseEmail: window.DawaahCloud?.currentEmail?.() || ''
    };
    localStorage.setItem(ADMIN_BACKUP_META_KEY, JSON.stringify(metadata));
    window.DawaahCloud?.saveBackupMetadata?.(metadata).catch(error => {
        console.warn('Could not save cloud backup metadata:', error);
    });
    renderBackupStatus();
}
