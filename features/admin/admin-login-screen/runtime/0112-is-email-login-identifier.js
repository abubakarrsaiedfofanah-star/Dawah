// Runtime slice from admin.js: isEmailLoginIdentifier.
function isEmailLoginIdentifier(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}
