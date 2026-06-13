// Runtime slice from admin.js: refreshAdminSetupUi.
async function refreshAdminSetupUi() {
    const registerItem = document.getElementById('adminRegisterTabItem');
    const registerButton = document.getElementById('adminRegisterTabBtn');
    const loginButton = document.getElementById('adminLoginTabBtn');
    try {
        if (useStaticAdminApi && window.SupabaseBackend?.enabled && !window.SupabaseBackend.hasAuthSession()) {
            registerItem?.classList.add('d-none');
            if (loginButton) {
                bootstrap.Tab.getOrCreateInstance(loginButton).show();
            }
            return;
        }
        const response = await fetch(`${API_URL}?action=getAdminSetupStatus`);
        const result = await parseJsonResponse(response);
        const canRegister = Boolean(result.success && result.data?.can_register_first_admin);
        registerItem?.classList.toggle('d-none', !canRegister);
        if (loginButton) {
            bootstrap.Tab.getOrCreateInstance(loginButton).show();
        }
    } catch (error) {
        const canRegister = useStaticAdminApi && !window.SupabaseBackend?.enabled && getLocalAdminAccounts().length === 0;
        registerItem?.classList.toggle('d-none', !canRegister);
        if (loginButton) {
            bootstrap.Tab.getOrCreateInstance(loginButton).show();
        }
    }
}
