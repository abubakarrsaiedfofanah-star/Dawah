// Runtime slice from admin.js: loadAdminWorkspaceSettings.
function loadAdminWorkspaceSettings() {
    const settings = readAdminWorkspaceSettings();
    const controls = {
        adminSettingAiChatEnabled: 'aiChatEnabled',
        adminSettingResearchHistory: 'researchHistory',
        adminSettingBrowserNotifications: 'browserNotifications',
        adminSettingCompactDashboard: 'compactDashboard',
        adminSettingReducedMotion: 'reducedMotion'
    };
    Object.entries(controls).forEach(([id, key]) => {
        const input = document.getElementById(id);
        if (input) input.checked = Boolean(settings[key]);
    });
    const mode = document.getElementById('adminSettingResearchMode');
    if (mode) mode.value = settings.researchMode || DEFAULT_ADMIN_WORKSPACE_SETTINGS.researchMode;
    applyAdminWorkspaceSettings(settings);
}
