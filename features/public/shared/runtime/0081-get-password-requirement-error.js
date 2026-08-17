// Runtime slice from daawah.js: getPasswordRequirementError.
function getPasswordRequirementError(password = '') {
    if (password.length < 8) {
        return 'Password must be at least 8 characters.';
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        return 'Password must include uppercase, lowercase, number, and symbol.';
    }
    return '';
}
