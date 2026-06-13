// Runtime slice from admin.js: stopAdminRealtimeListeners.
function stopAdminRealtimeListeners() {
    adminRealtimeUnsubscribers.forEach(unsubscribe => {
        try {
            unsubscribe?.();
        } catch (error) {
            console.warn('Admin realtime unsubscribe failed:', error);
        }
    });
    adminRealtimeUnsubscribers = [];
}
