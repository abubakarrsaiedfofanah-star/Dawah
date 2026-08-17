// Runtime slice from daawah.js: showPublicHashSection.
function showPublicHashSection() {
    const sectionId = String(window.location.hash || '').replace(/^#/, '');
    const publicSections = ['home', 'portals', 'about', 'mission', 'activities', 'leadership', 'gallery', 'contact'];
    if (!sectionId || !publicSections.includes(sectionId)) return false;
    if (getStoredCurrentUser()) return false;
    showLanding();
    setPublicSectionVisibility(sectionId);
    document.querySelectorAll('#landingNavbarNav .nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        link.classList.toggle('active', href === `#${sectionId}`);
    });
    closeLandingNavbar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
}
