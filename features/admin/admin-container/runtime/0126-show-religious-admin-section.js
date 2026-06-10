// Runtime slice from admin.js: showReligiousAdminSection.
function showReligiousAdminSection(sectionId) {
    switchAdminView('prayer');
    setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        section.style.boxShadow = '0 0 0 3px rgba(44,90,160,0.25)';
        setTimeout(() => {
            section.style.boxShadow = '';
        }, 1800);
    }, 120);
}
