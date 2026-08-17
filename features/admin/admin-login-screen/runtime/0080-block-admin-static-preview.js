// Runtime slice from admin.js: blockAdminStaticPreview.
function blockAdminStaticPreview() {
    document.getElementById('adminLoginScreen')?.classList.remove('d-none');
    document.getElementById('adminContainer')?.classList.add('locked');

    const registerItem = document.getElementById('adminRegisterTabItem');
    registerItem?.classList.add('d-none');

    document.querySelectorAll('.admin-auth-tabs, #adminLoginTab, #adminRegisterTab, #adminForgotTab').forEach(element => {
        element.classList.add('d-none');
    });
    document.querySelectorAll('#adminLoginScreen input, #adminLoginScreen button:not([data-bs-dismiss])').forEach(control => {
        control.disabled = true;
    });

    const error = document.getElementById('adminLoginError');
    if (error) {
        error.className = 'alert alert-warning admin-login-error active';
        error.innerHTML = `
            <strong>Admin panel is blocked on this preview link.</strong><br>
            This static preview page cannot run the live backend. Use the live admin app for real account changes and updates.
            Use the real hosted PHP/Supabase link for admin login, approvals, and system changes.
        `;
    }
}

['click', 'keydown', 'mousemove', 'touchstart'].forEach(eventName => {
    document.addEventListener(eventName, () => {
        if (currentAdmin) startAdminSessionTimer();
    }, { passive: true });
});

// Check if user is authenticated as admin
