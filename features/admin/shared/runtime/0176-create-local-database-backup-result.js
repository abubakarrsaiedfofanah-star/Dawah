// Runtime slice from admin.js: createLocalDatabaseBackupResult.
function createLocalDatabaseBackupResult() {
    const backup = buildLocalDatabaseBackup();
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    return {
        success: true,
        data: {
            filename: `dawaah-firebase-backup-${date}.json`,
            mime: 'application/json;charset=utf-8',
            content: JSON.stringify(backup, null, 2)
        }
    };
}
