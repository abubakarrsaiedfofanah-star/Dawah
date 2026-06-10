// Runtime slice from daawah.js: deleteOfficerHadith.
function deleteOfficerHadith(hadithId) {
    if (!hasPermission('manage_hadiths')) {
        showNotification('Only the Amir/Director of Da\'awah Team can delete hadiths.', 'warning');
        return;
    }
    if (!confirm('Delete this hadith?')) return;

    if (frontendOnly) {
        const hadiths = readList('adminHadiths').filter(hadith => Number(hadith.id) !== Number(hadithId));
        localStorage.setItem('adminHadiths', JSON.stringify(hadiths));
        loadOfficerHadiths();
        initializeHadiths();
        showNotification('Hadith deleted.', 'success');
        return;
    }

    fetch('firestore-disabled-endpoint?action=deleteHadith', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(authPayload({ hadith_id: Number(hadithId) }))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not delete hadith');
        loadOfficerHadiths();
        initializeHadiths();
        showNotification('Hadith deleted.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not delete hadith', 'danger'));
}

// ============================================
// HADITH REMINDER SYSTEM
// ============================================

let currentHadithIndex = 0;
let allHadiths = [];
let hadithsLoaded = false;

// Initialize Hadiths on Dashboard Load
