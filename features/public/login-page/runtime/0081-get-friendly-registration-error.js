// Runtime slice from daawah.js: getFriendlyRegistrationError.
function getFriendlyRegistrationError(error) {
    const message = String(error?.message || error || '');
    if (/EMAIL_EXISTS|email-already-in-use|User already registered/i.test(message)) {
        return 'This email is already registered. Please login or use forgot password.';
    }
    if (/INVALID_EMAIL|invalid-email/i.test(message)) {
        return 'Please enter a valid email address.';
    }
    if (/WEAK_PASSWORD|weak-password|Password should be at least/i.test(message)) {
        return 'Password is too weak. Please use a stronger password (8+ characters recommended).';
    }
    if (/network|failed to fetch/i.test(message)) {
        return 'Registration could not connect. Check your internet, refresh the main web.app link, and try again.';
    }
    return message || 'Registration failed. Please check your details and try again.';
}
