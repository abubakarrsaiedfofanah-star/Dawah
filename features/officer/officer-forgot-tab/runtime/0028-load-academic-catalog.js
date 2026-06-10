// Runtime slice from officer.js: loadAcademicCatalog.
function loadAcademicCatalog() {
    renderOfficerSchools();
    if (frontendOnly || !window.DAWAAH_LEGACY_PHP_BASE_URL) {
        academicCatalog = FALLBACK_ACADEMIC_CATALOG;
        renderOfficerSchools();
        return;
    }

    fetch('firestore-disabled-endpoint?action=getAcademicCatalog')
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success || !result.data) {
            throw new Error(result.message || 'Could not load schools');
        }
        academicCatalog = result.data;
        renderOfficerSchools();
    })
    .catch(error => {
        console.warn('Using fallback academic catalog:', error);
        academicCatalog = FALLBACK_ACADEMIC_CATALOG;
        renderOfficerSchools();
    });
}
