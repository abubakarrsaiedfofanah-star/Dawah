// Runtime slice from admin.js: writeAdminWorkspaceSettings.
function writeAdminWorkspaceSettings(settings) {
    localStorage.setItem(ADMIN_WORKSPACE_SETTINGS_KEY, JSON.stringify({
        ...DEFAULT_ADMIN_WORKSPACE_SETTINGS,
        ...(settings || {})
    }));
    window.dispatchEvent(new CustomEvent('dawaah:workspace-settings-changed'));
}
