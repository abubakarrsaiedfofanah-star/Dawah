// Runtime slice from admin.js: rememberDatabaseBackup.
function rememberDatabaseBackup(filename) {
    const metadata = {
        filename,
        downloadedAt: new Date().toISOString(),
        admin: currentAdmin?.username || currentAdmin?.email || '',
        SupabaseUid: window.SupabaseBackend?.currentUid?.() || '',
        SupabaseEmail: window.SupabaseBackend?.currentEmail?.() || ''
    };
    localStorage.setItem(ADMIN_BACKUP_META_KEY, JSON.stringify(metadata));
    window.SupabaseBackend?.saveBackupMetadata?.(metadata).catch(error => {
        console.warn('Could not save cloud backup metadata:', error);
    });
    renderBackupStatus();
}
