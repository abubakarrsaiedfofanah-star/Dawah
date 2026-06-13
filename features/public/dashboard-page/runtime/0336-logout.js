// Runtime slice from daawah.js: logout.
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        stopRoleDashboardLiveRefresh();
        window.SupabaseBackend?.logout?.();
        if (!frontendOnly) {
            fetch('supabase-required-endpoint?action=logoutUser', {
                method: 'POST',
                credentials: 'same-origin'
            }).catch(() => {});
        }
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');

        currentUser = null;
        currentRole = null;

        document.getElementById('dashboardPage').classList.remove('active');
        document.getElementById('loginPage').classList.add('active');

        document.getElementById('loginForm').reset();
        document.getElementById('registrationForm').reset();
    }
}

// Validation
