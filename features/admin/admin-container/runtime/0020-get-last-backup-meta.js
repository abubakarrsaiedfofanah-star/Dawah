// Runtime slice from admin.js: getLastBackupMeta.
function getLastBackupMeta() {
    try {
        return JSON.parse(localStorage.getItem(ADMIN_BACKUP_META_KEY) || 'null');
    } catch (error) {
        return null;
    }
}
