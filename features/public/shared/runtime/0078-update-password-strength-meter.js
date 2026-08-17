// Runtime slice from daawah.js: updatePasswordStrengthMeter.
function updatePasswordStrengthMeter() {
    const input = document.getElementById('regPassword');
    const wrapper = document.querySelector('.password-strength');
    const bar = document.getElementById('passwordStrengthBar');
    const text = document.getElementById('passwordStrengthText');
    if (!input || !wrapper || !bar || !text) return;

    const score = getPasswordStrength(input.value);
    bar.style.width = `${score}%`;
    wrapper.classList.toggle('is-medium', score >= 50 && score < 80);
    wrapper.classList.toggle('is-strong', score >= 80);
    text.textContent = score >= 80
        ? 'Strong password.'
        : score >= 50
            ? 'Good start. Add a symbol or more characters for stronger protection.'
            : 'Use 8+ characters with uppercase, lowercase, number, and symbol.';
}
