// Runtime slice from daawah.js: normalizeStudentId.
function normalizeStudentId(value) {
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}
