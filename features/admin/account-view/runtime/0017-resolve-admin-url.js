// Runtime slice from admin.js: resolveAdminUrl.
function resolveAdminUrl(url) {
    if (!url) return '';
    if (/^(https?:|mailto:|tel:|data:|blob:)/i.test(url)) return url;
    const cleanUrl = url.replace(/^\/+/, '');
    return cleanUrl;
}

window.fetch = function(resource, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const url = String(resource);
    const isAdminApiRequest = url.includes(API_URL);
    const token = currentAdmin?.csrf_token || JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null')?.csrf_token || '';
    if (isAdminApiRequest && token && ['POST', 'PUT', 'DELETE'].includes(method)) {
        const headers = new Headers(options.headers || {});
        if (!headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', token);
        options = { ...options, headers };
    }
    if (!useStaticAdminApi || !url.includes(API_URL)) {
        return realFetch(resource, options);
    }

    const params = new URL(url, location.href).searchParams;
    const action = params.get('action');
    let payload = {};

    try {
        payload = options.body ? JSON.parse(options.body) : {};
    } catch (error) {
        payload = {};
    }

    if (
        window.SupabaseBackend?.enabled &&
        window.SupabaseBackend?.hasAuthSession?.() &&
        SUPABASE_ADMIN_ACCOUNT_ACTIONS.has(action)
    ) {
        return handleAdminAccountApi(action, method, payload)
            .then(result => ({
                ok: true,
                json: () => Promise.resolve(result)
            }))
            .catch(error => ({
                ok: false,
                json: () => Promise.resolve({ success: false, message: error.message || 'Admin account action failed.' })
            }));
    }

    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(handleStaticAdminApi(action, method, payload, params))
            .then(result => {
                logStaticContentActivity(action, method, payload, result);
                return result;
            })
    });
};
