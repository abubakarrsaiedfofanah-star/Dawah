// Runtime slice from admin.js: getBackupStatus.
function getBackupStatus() {
    const meta = getLastBackupMeta();
    if (!meta?.downloadedAt) {
        return {
            status: 'warn',
            detail: 'No browser-recorded backup yet. Download one before handover or after major data changes.'
        };
    }
    const downloadedAt = new Date(meta.downloadedAt);
    const ageMs = Date.now() - downloadedAt.getTime();
    const ageDays = Math.max(0, Math.floor(ageMs / 86400000));
    const due = ageDays >= ADMIN_BACKUP_DUE_DAYS;
    return {
        status: due ? 'warn' : 'ok',
        detail: `${due ? 'Backup due' : 'Backup current'}: last downloaded ${ageDays === 0 ? 'today' : `${ageDays} day(s) ago`} (${downloadedAt.toLocaleString()}).`
    };
}
