// Runtime slice from admin.js: readStore.
function readStore(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}
