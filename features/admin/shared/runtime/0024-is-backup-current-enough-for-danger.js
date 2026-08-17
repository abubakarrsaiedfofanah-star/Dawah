// Runtime slice from admin.js: isBackupCurrentEnoughForDanger.
function isBackupCurrentEnoughForDanger() {
    const backup = getBackupStatus();
    if (backup.status === 'ok') return true;
    return confirm(`${backup.detail}\n\nThis action can remove records. Continue without downloading a fresh backup first?`);
}
