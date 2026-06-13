// Runtime slice from officer.js: readLocalResetCodes.
function readLocalResetCodes() {
    try {
        return JSON.parse(localStorage.getItem(OFFICER_RESET_CODE_STORE) || '{}');
    } catch (error) {
        return {};
    }
}
