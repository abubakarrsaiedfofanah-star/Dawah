// Runtime slice from daawah.js: updateDashboardStats.
function updateDashboardStats() {
    if (!currentUser) return;
    try {
        loadDashboardData();
    } catch (error) {
        console.error('Dashboard stats update failed:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp().catch(error => {
        console.error('App initialization failed:', error);
        document.documentElement.classList.remove('pending-auth-route');
        showLanding?.();
        showNotification?.('The app recovered from a startup problem. Please refresh if anything looks stale.', 'warning');
    });
    try {
        attachEventListeners();
        loadHostingCapabilities();
        attachWelfareSyncListeners();
        loadLandingPageContent(); // Load dynamic content for landing page
    } catch (error) {
        console.error('Startup listener setup failed:', error);
        document.documentElement.classList.remove('pending-auth-route');
    }
});

window.addEventListener('hashchange', function() {
    showPublicHashSection();
});
