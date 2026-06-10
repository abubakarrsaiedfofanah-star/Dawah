// Runtime slice from daawah.js: setTextById.
function setTextById(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || '';
}
