// Runtime slice from admin.js: resetAdminWorkspaceSettings.
function resetAdminWorkspaceSettings() {
    writeAdminWorkspaceSettings(DEFAULT_ADMIN_WORKSPACE_SETTINGS);
    loadAdminWorkspaceSettings();
    showNotification('Settings reset to defaults.', 'info');
}

window.addEventListener('DOMContentLoaded', () => applyAdminWorkspaceSettings());
window.addEventListener('storage', event => {
    if (event.key === ADMIN_WORKSPACE_SETTINGS_KEY) applyAdminWorkspaceSettings();
});

// Switch between admin views
