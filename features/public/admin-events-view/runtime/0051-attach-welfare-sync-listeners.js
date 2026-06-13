// Runtime slice from daawah.js: attachWelfareSyncListeners.
function attachWelfareSyncListeners() {
    window.addEventListener('storage', function(event) {
        if (event.key === 'welfareRequests') {
            welfareRequests = readList('welfareRequests');
            updateWelfareRequestsList();
            updateDashboardStats();
            refreshActiveRoleView();
        }
        if (['allMembers', 'payments', 'donations', 'registeredEvents', ...LIVE_PUBLIC_STORE_KEYS].includes(event.key)) {
            refreshLocalRoleStores();
            refreshActiveRoleView();
        }
    });

    window.addEventListener('focus', function() {
        if (currentUser) {
            syncWelfareRequestsFromAdmin().finally(() => updateWelfareRequestsList());
        }
    });

    setInterval(() => {
        const welfareView = document.getElementById('welfareView');
        if (currentUser && welfareView?.classList.contains('active')) {
            syncWelfareRequestsFromAdmin().finally(() => updateWelfareRequestsList());
        }
    }, 5000);
}

// INITIALIZATION
