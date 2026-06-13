// Runtime slice from admin.js: saveAdminWorkspaceSettings.
function saveAdminWorkspaceSettings() {
    const settings = collectAdminWorkspaceSettingsFromForm();
    writeAdminWorkspaceSettings(settings);
    applyAdminWorkspaceSettings(settings);
    if (settings.browserNotifications && 'Notification' in window) Notification.requestPermission().catch(() => {});
    showNotification('Settings saved successfully.', 'success');
}
