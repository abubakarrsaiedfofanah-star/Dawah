// Runtime slice from daawah.js: resolveAppAsset.
function resolveAppAsset(path) {
    if (!path) return '';
    if (/^(data:|blob:|https?:)/i.test(path)) return path;
    if (useLegacyPhpApi) {
        return LEGACY_PHP_BASE_URL + String(path).replace(/^\/+/, '');
    }
    return path;
}
