// Runtime slice from admin.js: recordAdminNotification.
function recordAdminNotification(message, type = 'info') {
    try {
        const text = String(message || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!text) return;
        const log = readStore(ADMIN_NOTIFICATION_LOG_KEY);
        log.unshift({
            id: Date.now(),
            message: text,
            type,
            createdAt: new Date().toISOString(),
            admin: currentAdmin?.username || currentAdmin?.email || 'system'
        });
        localStorage.setItem(ADMIN_NOTIFICATION_LOG_KEY, JSON.stringify(log.slice(0, 200)));
    } catch (error) {
        console.warn('Could not record admin notification:', error);
    }
}
