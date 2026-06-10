// Runtime slice from daawah.js: getTreasurerWhatsappUrl.
function getTreasurerWhatsappUrl(message = '') {
    const settings = readStoredObject('siteSettings', {});
    const configured = settings.social_whatsapp || settings.contact_whatsapp || 'https://api.whatsapp.com/send?phone=23231422167';
    const base = String(configured).startsWith('http')
        ? configured.split('?')[0]
        : `https://wa.me/${String(configured).replace(/\D/g, '')}`;
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}text=${encodeURIComponent(message)}`;
}
