// Runtime slice from daawah.js: attachUserCsrfHeader.
function attachUserCsrfHeader(options = {}) {
    const token = getUserCsrfToken();
    if (!token) return options;
    const headers = new Headers(options.headers || {});
    if (!headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', token);
    return { ...options, headers };
}
