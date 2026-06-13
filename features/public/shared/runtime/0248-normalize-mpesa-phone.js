// Runtime slice from daawah.js: normalizeMpesaPhone.
function normalizeMpesaPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
    if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
    return digits;
}
