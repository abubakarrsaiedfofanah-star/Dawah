// Runtime slice from admin.js: readAdminWorkspaceSettings.
function readAdminWorkspaceSettings() {
    try {
        return {
            ...DEFAULT_ADMIN_WORKSPACE_SETTINGS,
            ...(JSON.parse(localStorage.getItem(ADMIN_WORKSPACE_SETTINGS_KEY) || '{}') || {})
        };
    } catch (error) {
        return { ...DEFAULT_ADMIN_WORKSPACE_SETTINGS };
    }
}
