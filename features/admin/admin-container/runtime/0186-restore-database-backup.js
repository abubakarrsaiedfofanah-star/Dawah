// Runtime slice from admin.js: restoreDatabaseBackup.
function restoreDatabaseBackup(input) {
    const file = input?.files?.[0];
    if (!file) return;
    if (!currentAdmin?.isMainAdmin) {
        showNotification('Only the main admin can request database restore.', 'danger');
        input.value = '';
        return;
    }
    if (!confirm('Restore can overwrite live data. Continue only if this is the correct Supabase JSON backup and restore mode is enabled.')) {
        input.value = '';
        return;
    }
    showNotification('Supabase restore is intentionally disabled in the client. Restore backups from the Supabase console or a trusted admin script.', 'warning');
    input.value = '';
}
