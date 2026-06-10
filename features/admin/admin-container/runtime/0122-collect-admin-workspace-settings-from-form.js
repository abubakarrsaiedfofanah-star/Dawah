// Runtime slice from admin.js: collectAdminWorkspaceSettingsFromForm.
function collectAdminWorkspaceSettingsFromForm() {
    return {
        aiChatEnabled: Boolean(document.getElementById('adminSettingAiChatEnabled')?.checked),
        researchHistory: Boolean(document.getElementById('adminSettingResearchHistory')?.checked),
        browserNotifications: Boolean(document.getElementById('adminSettingBrowserNotifications')?.checked),
        compactDashboard: Boolean(document.getElementById('adminSettingCompactDashboard')?.checked),
        reducedMotion: Boolean(document.getElementById('adminSettingReducedMotion')?.checked),
        researchMode: document.getElementById('adminSettingResearchMode')?.value || DEFAULT_ADMIN_WORKSPACE_SETTINGS.researchMode
    };
}
