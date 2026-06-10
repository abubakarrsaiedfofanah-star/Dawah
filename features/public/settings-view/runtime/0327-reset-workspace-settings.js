// Runtime slice from daawah.js: resetWorkspaceSettings.
function resetWorkspaceSettings() {
    writeWorkspaceSettings(DEFAULT_WORKSPACE_SETTINGS);
    loadWorkspaceSettings();
    showNotification('Settings reset to defaults.', 'info');
}

window.addEventListener('DOMContentLoaded', () => applyWorkspaceSettings());
window.addEventListener('storage', event => {
    if (event.key === WORKSPACE_SETTINGS_KEY) applyWorkspaceSettings();
});

window.loadWorkspaceSettings = loadWorkspaceSettings;
window.saveWorkspaceSettings = saveWorkspaceSettings;
window.resetWorkspaceSettings = resetWorkspaceSettings;
window.readWorkspaceSettings = readWorkspaceSettings;

// UTILITY FUNCTIONS
