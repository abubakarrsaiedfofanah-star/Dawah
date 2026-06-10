// Runtime slice from daawah.js: isEmailLoginIdentifier.
function isEmailLoginIdentifier(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}
