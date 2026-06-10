// Runtime slice from admin.js: refreshAdminSessionToken.
function refreshAdminSessionToken() {
    return realFetch(`${API_URL}?action=checkAdminSession`, { credentials: 'same-origin' })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !result.data?.csrf_token) {
                throw new Error(result.message || 'Admin session expired. Please login again.');
            }
            setAdminUser(result.data);
            return result.data.csrf_token;
        });
}
