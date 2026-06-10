// Runtime slice from daawah.js: collectWorkspaceSettingsFromForm.
function collectWorkspaceSettingsFromForm() {
    return {
        aiChatEnabled: Boolean(document.getElementById('settingAiChatEnabled')?.checked),
        researchHistory: Boolean(document.getElementById('settingResearchHistory')?.checked),
        browserNotifications: Boolean(document.getElementById('settingBrowserNotifications')?.checked),
        compactDashboard: Boolean(document.getElementById('settingCompactDashboard')?.checked),
        reducedMotion: Boolean(document.getElementById('settingReducedMotion')?.checked),
        researchMode: document.getElementById('settingResearchMode')?.value || DEFAULT_WORKSPACE_SETTINGS.researchMode
    };
}
