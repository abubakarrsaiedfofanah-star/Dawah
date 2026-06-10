// Runtime slice from admin.js: applyAdminWorkspaceSettings.
function applyAdminWorkspaceSettings(settings = readAdminWorkspaceSettings()) {
    document.body.classList.toggle('settings-compact-dashboard', Boolean(settings.compactDashboard));
    document.body.classList.toggle('settings-reduced-motion', Boolean(settings.reducedMotion));
    const widget = document.getElementById('aiChatWidget');
    if (widget) widget.classList.toggle('ai-chat-widget--preference-hidden', !settings.aiChatEnabled);
}
