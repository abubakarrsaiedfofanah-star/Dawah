// Runtime slice from daawah.js: readWorkspaceSettings.
function readWorkspaceSettings() {
    try {
        return {
            ...DEFAULT_WORKSPACE_SETTINGS,
            ...(JSON.parse(localStorage.getItem(WORKSPACE_SETTINGS_KEY) || '{}') || {})
        };
    } catch (error) {
        return { ...DEFAULT_WORKSPACE_SETTINGS };
    }
}
