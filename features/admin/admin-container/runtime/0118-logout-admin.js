// Runtime slice from admin.js: logoutAdmin.
function logoutAdmin() {
    clearTimeout(adminSessionTimeoutId);
    clearTimeout(adminSessionWarningId);
    stopAdminRealtimeListeners();
    logLocalAdminActivity('logoutAdmin', { message: 'Admin logged out' });
    window.SupabaseBackend?.logout?.();
    fetch(`${API_URL}?action=logoutAdmin`, { method: 'POST' }).catch(() => {});
    sessionStorage.removeItem('currentAdminUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
    window.location.href = 'index.html';
}

const ADMIN_WORKSPACE_SETTINGS_KEY = 'dawaahAdminWorkspaceSettings';
const DEFAULT_ADMIN_WORKSPACE_SETTINGS = {
    aiChatEnabled: true,
    researchHistory: true,
    researchMode: 'groq_chat',
    browserNotifications: false,
    compactDashboard: false,
    reducedMotion: false
};
