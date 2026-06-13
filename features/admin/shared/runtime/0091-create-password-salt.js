// Runtime slice from admin.js: createPasswordSalt.
function createPasswordSalt() {
    const salt = new Uint8Array(16);
    if (window.crypto?.getRandomValues) {
        window.crypto.getRandomValues(salt);
        return bytesToHex(salt);
    }
    for (let i = 0; i < salt.length; i += 1) {
        salt[i] = Math.floor(Math.random() * 256);
    }
    return bytesToHex(salt);
}
