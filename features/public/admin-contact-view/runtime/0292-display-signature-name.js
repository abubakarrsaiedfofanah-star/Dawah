// Runtime slice from daawah.js: displaySignatureName.
function displaySignatureName(value, fallback = 'Imam') {
    const name = String(value || '').trim();
    if (!name || /^main admin$/i.test(name)) return fallback;
    return name;
}
