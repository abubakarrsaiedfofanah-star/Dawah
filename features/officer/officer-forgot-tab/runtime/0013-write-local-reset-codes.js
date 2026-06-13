// Runtime slice from officer.js: writeLocalResetCodes.
function writeLocalResetCodes(codes) {
    localStorage.setItem(OFFICER_RESET_CODE_STORE, JSON.stringify(codes || {}));
}
