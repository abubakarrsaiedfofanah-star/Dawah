// Runtime slice from daawah.js: readList.
function readList(key) {
    const value = safeJsonParse(localStorage.getItem(key), [], key);
    return Array.isArray(value) ? value : [];
}
