// Runtime slice from admin.js: adminApiRequest.
function adminApiRequest(action, options = {}, retryOnCsrf = true) {
    return fetch(`${API_URL}?action=${action}`, options)
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (retryOnCsrf && !result.success && /security token expired/i.test(result.message || '')) {
                return refreshAdminSessionToken()
                    .then(() => adminApiRequest(action, options, false));
            }
            return result;
        });
}
