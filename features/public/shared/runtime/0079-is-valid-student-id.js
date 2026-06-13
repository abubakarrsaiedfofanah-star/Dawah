// Runtime slice from daawah.js: isValidStudentId.
function isValidStudentId(value) {
    return /^[A-Z]{2,10}\/\d{4}\/\d{3,8}$/.test(normalizeStudentId(value));
}
