// Runtime slice from admin.js: writeStore.
function writeStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    saveCloudStore(key, data);
}
