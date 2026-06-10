// Runtime slice from daawah.js: writeWorkspaceSettings.
function writeWorkspaceSettings(settings) {
    localStorage.setItem(WORKSPACE_SETTINGS_KEY, JSON.stringify({
        ...DEFAULT_WORKSPACE_SETTINGS,
        ...(settings || {})
    }));
    window.dispatchEvent(new CustomEvent('dawaah:workspace-settings-changed'));
}
