// Runtime slice from daawah.js: validatePhoneNumber.
function validatePhoneNumber(phone) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// LocalStorage Helpers
