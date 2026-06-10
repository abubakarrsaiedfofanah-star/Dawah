// Runtime slice from daawah.js: saveWorkspaceSettings.
function saveWorkspaceSettings() {
    const settings = collectWorkspaceSettingsFromForm();
    writeWorkspaceSettings(settings);
    applyWorkspaceSettings(settings);
    if (settings.browserNotifications) enableBrowserNotifications();
    showNotification('Settings saved successfully.', 'success');
}
