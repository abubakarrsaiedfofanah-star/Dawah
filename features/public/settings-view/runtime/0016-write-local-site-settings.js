// Runtime slice from daawah.js: writeLocalSiteSettings.
function writeLocalSiteSettings(settings) {
    localStorage.setItem('siteSettings', JSON.stringify({ ...getLocalSiteSettings(), ...(settings || {}) }));
}
