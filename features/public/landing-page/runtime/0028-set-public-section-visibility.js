// Runtime slice from daawah.js: setPublicSectionVisibility.
function setPublicSectionVisibility(sectionId) {
    const landingPage = document.getElementById('landingPage');
    if (!landingPage) return;
    const activeSectionId = sectionId || '';
    landingPage.classList.toggle('portal-view-active', activeSectionId === 'portals');
    const sections = landingPage.querySelectorAll('.landing-hero, .landing-section');
    sections.forEach(section => {
        const isPortalSection = section.id === 'portals';
        const shouldShow = (!activeSectionId && !isPortalSection)
            || (activeSectionId === 'home' && !isPortalSection)
            || section.id === activeSectionId;
        section.classList.toggle('public-section-hidden', !shouldShow);
    });
    applyPortalAccessRules();
}
