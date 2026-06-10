// Runtime slice from daawah.js: displaySignatureTitle.
function displaySignatureTitle(value, fallback = 'Imam') {
    const title = String(value || '').trim();
    if (!title || /^(main admin|authorized signature)$/i.test(title)) return fallback;
    return title;
}
