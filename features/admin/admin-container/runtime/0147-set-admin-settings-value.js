// Runtime slice from admin.js: setAdminSettingsValue.
function setAdminSettingsValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value || '';
}
