// Runtime slice from admin.js: getLocalAdminPrompt.
function getLocalAdminPrompt() {
    if (useStaticAdminApi && window.SupabaseBackend?.enabled) {
        return 'Login with the registered Supabase admin email. Use Register Admin only for the first main admin setup.';
    }
    if (isHostedStaticAdminPage && !window.SupabaseBackend?.enabled) {
        const detail = window.SupabaseBackend?.configError || 'Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel, then redeploy.';
        return `Supabase is not configured for this hosted admin page. ${detail}`;
    }
    const count = getLocalAdminAccounts().length;
    if (count === 0) {
        return 'Create the first admin account. After that, admins are added inside the panel.';
    }
    return 'Login with an admin account. New admins must be added inside the panel.';
}
