// Runtime slice from admin.js: checkAdminAuth.
async function checkAdminAuth() {
    try {
        const response = await fetch(`${API_URL}?action=checkAdminSession`);
        const result = await parseJsonResponse(response);
        if (!result.success || !result.data) {
            showAdminLogin(useStaticAdminApi ? getLocalAdminPrompt() : '');
            return false;
        }

        setAdminUser(result.data);
        showAdminPanel();
        return true;
    } catch (error) {
        showAdminLogin(getLocalAdminPrompt());
        return false;
    }
}
