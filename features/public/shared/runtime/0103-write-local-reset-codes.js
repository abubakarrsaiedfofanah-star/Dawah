// Runtime slice from daawah.js: writeLocalResetCodes.
function writeLocalResetCodes(codes) {
    localStorage.setItem(LOCAL_RESET_CODE_STORE, JSON.stringify(codes || {}));
}
