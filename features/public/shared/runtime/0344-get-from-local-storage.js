// Runtime slice from daawah.js: getFromLocalStorage.
function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return safeJsonParse(data, null, key);
}
