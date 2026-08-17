// Runtime slice from admin.js: bytesToHex.
function bytesToHex(bytes) {
    return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}
