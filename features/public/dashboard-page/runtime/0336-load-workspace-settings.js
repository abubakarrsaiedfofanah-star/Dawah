// Runtime slice from daawah.js: loadWorkspaceSettings.
function loadWorkspaceSettings() {
    const settings = readWorkspaceSettings();
    const controls = {
        settingAiChatEnabled: 'aiChatEnabled',
        settingResearchHistory: 'researchHistory',
        settingBrowserNotifications: 'browserNotifications',
        settingCompactDashboard: 'compactDashboard',
        settingReducedMotion: 'reducedMotion'
    };
    Object.entries(controls).forEach(([id, key]) => {
        const input = document.getElementById(id);
        if (input) input.checked = Boolean(settings[key]);
    });
    const mode = document.getElementById('settingResearchMode');
    if (mode) mode.value = settings.researchMode || DEFAULT_WORKSPACE_SETTINGS.researchMode;
    applyWorkspaceSettings(settings);
}
