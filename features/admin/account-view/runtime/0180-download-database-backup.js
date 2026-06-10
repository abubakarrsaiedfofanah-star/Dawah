// Runtime slice from admin.js: downloadDatabaseBackup.
async function downloadDatabaseBackup() {
    if (!currentAdmin?.isMainAdmin) {
        showNotification('Only the main admin can download database backups.', 'danger');
        return;
    }
    if (!confirm('Download a private backup of the current Firebase/Firestore database? Keep this file private because it contains account data.')) return;

    try {
        let result;
        if (useStaticAdminApi) {
            const backup = await buildCloudDatabaseBackup();
            const date = new Date().toISOString().replace(/[:.]/g, '-');
            result = {
                success: true,
                data: {
                    filename: `dawaah-firebase-backup-${date}.json`,
                    mime: 'application/json;charset=utf-8',
                    content: JSON.stringify(backup, null, 2)
                }
            };
        } else {
            const response = await fetch(`${API_URL}?action=createDatabaseBackup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            result = await parseJsonResponse(response);
        }
        if (!result.success || !result.data?.content) {
            throw new Error(result.message || 'Could not create Firestore backup');
        }
        const filename = result.data.filename || `dawaah-firestore-backup-${Date.now()}.json`;
        downloadBlob(filename, result.data.content, result.data.mime || 'application/json;charset=utf-8');
        rememberDatabaseBackup(filename);
        showNotification('Firestore backup downloaded. Keep it private.', 'success');
        loadMyAdminActivityLogs();
        if (currentAdmin?.isMainAdmin) {
            loadAdminActivityLogs();
        }
    } catch (error) {
        showNotification(error.message || 'Could not create Firestore backup', 'danger');
    }
}
