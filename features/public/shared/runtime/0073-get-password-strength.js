// Runtime slice from daawah.js: getPasswordStrength.
function getPasswordStrength(password = '') {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/i.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;
    if (password.length >= 12) score += 10;
    return Math.min(score, 100);
}
