// Runtime slice from daawah.js: normalizeContactEmail.
function normalizeContactEmail(email) {
    return String(email || '').trim() === 'info@dawah.org' ? 'info@dawah.org' : email;
}
