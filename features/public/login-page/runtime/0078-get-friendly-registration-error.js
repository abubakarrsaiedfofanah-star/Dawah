// Runtime slice from daawah.js: getFriendlyRegistrationError.
function getFriendlyRegistrationError(error) {
    const message = String(error?.message || error || '');
    if (/EMAIL_EXISTS|email-already-in-use/i.test(message)) {
        return 'This email is already registered. Please login or use forgot password.';
    }
    if (/INVALID_EMAIL|invalid-email/i.test(message)) {
        return 'Please enter a valid email address.';
    }
    if (/WEAK_PASSWORD|weak-password/i.test(message)) {
        return 'Password is too weak. Use 8+ characters with uppercase, lowercase, number, and symbol.';
    }
    if (/network|failed to fetch/i.test(message)) {
        return 'Registration could not connect. Check your internet, refresh the main web.app link, and try again.';
    }
    return message || 'Registration failed. Please check your details and try again.';
}
