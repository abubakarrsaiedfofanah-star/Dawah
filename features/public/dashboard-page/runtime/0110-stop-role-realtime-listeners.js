// Runtime slice from daawah.js: stopRoleRealtimeListeners.
function stopRoleRealtimeListeners() {
    roleRealtimeUnsubscribers.forEach(unsubscribe => {
        try {
            unsubscribe?.();
        } catch (error) {
            console.warn('Realtime dashboard unsubscribe failed:', error);
        }
    });
    roleRealtimeUnsubscribers = [];
}
