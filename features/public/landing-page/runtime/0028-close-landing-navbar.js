// Runtime slice from daawah.js: closeLandingNavbar.
function closeLandingNavbar() {
    const nav = document.getElementById('landingNavbarNav');
    if (nav?.classList.contains('show') && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(nav).hide();
    }
}
