// Runtime slice from daawah.js: whatsappLabel.
function whatsappLabel(url, fallbackPhone = '') {
    const phone = String(fallbackPhone || '').trim();
    if (phone) return phone;
    const match = String(url || '').match(/(?:phone=|wa\.me\/)(\d+)/i);
    return match ? `+${match[1]}` : 'WhatsApp';
}
