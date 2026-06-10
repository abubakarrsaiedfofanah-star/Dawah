// Runtime slice from daawah.js: renderNumberOptions.
function renderNumberOptions(selectId, values, placeholder, label) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>` +
        values.map(value => `<option value="${value}">${label} ${value}</option>`).join('');
}
