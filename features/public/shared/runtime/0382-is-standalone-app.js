// Runtime slice from daawah.js: isStandaloneApp.
function isStandaloneApp() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
