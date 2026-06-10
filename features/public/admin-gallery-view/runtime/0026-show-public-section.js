// Runtime slice from daawah.js: showPublicSection.
function showPublicSection(sectionId, trigger = null) {
    showLanding();
    setPublicSectionVisibility(sectionId || 'home');
    document.querySelectorAll('#landingNavbarNav .nav-link').forEach(link => {
        link.classList.toggle('active', trigger && link === trigger);
    });
    closeLandingNavbar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
}

window.showLanding = showLanding;
window.showLoginPage = showLoginPage;
window.activateAuthTab = activateAuthTab;
window.scrollToSection = scrollToSection;
window.showPublicSection = showPublicSection;
window.showPublicHashSection = showPublicHashSection;

// LEADERSHIP AND GALLERY FUNCTIONS
