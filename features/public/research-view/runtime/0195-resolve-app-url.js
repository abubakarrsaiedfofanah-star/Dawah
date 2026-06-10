// Runtime slice from daawah.js: resolveAppUrl.
function resolveAppUrl(url) {
    if (!url) return '';
    if (/^(https?:|mailto:|tel:|data:|blob:)/i.test(url)) return url;
    const cleanUrl = url.replace(/^\/+/, '');
    if (useLegacyPhpApi) {
        return LEGACY_PHP_BASE_URL + cleanUrl;
    }
    return cleanUrl;
}

// RESEARCH ASSISTANT
