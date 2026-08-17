// Runtime slice from daawah.js: readLocalResetCodes.
function readLocalResetCodes() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_RESET_CODE_STORE) || '{}');
    } catch (error) {
        return {};
    }
}
