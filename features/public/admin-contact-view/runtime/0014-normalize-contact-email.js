// Runtime slice from daawah.js: normalizeContactEmail.
function normalizeContactEmail(email) {
    return String(email || '').trim() === 'info@daawahteam.org' ? 'info@dawaah.org' : email;
}
