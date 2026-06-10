// Runtime slice from admin.js: legacyHashAdminPassword.
async function legacyHashAdminPassword(password) {
    if (window.crypto?.subtle) {
        const data = new TextEncoder().encode(password);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return bytesToHex(new Uint8Array(digest));
    }
    return btoa(unescape(encodeURIComponent(password)));
}
