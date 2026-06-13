// Runtime slice from officer.js: isEmailLoginIdentifier.
function isEmailLoginIdentifier(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}
