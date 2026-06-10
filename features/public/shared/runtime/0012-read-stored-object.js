// Runtime slice from daawah.js: readStoredObject.
function readStoredObject(key, fallback = {}) {
    const value = safeJsonParse(localStorage.getItem(key), fallback, key);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}
