// Runtime slice from daawah.js: setContactLinkById.
function setContactLinkById(id, value, hrefPrefix) {
    const element = document.getElementById(id);
    if (!element) return;
    const text = String(value || '').trim();
    element.textContent = text;
    if (text) {
        element.href = `${hrefPrefix}${text}`;
    } else {
        element.removeAttribute('href');
    }
}
