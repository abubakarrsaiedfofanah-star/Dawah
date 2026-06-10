// Runtime slice from daawah.js: saveOfficerHadith.
function saveOfficerHadith(event) {
    event.preventDefault();
    if (!hasPermission('manage_hadiths')) {
        showNotification('Only the Amir/Director of Da\'awah Team can manage hadiths.', 'warning');
        return;
    }

    const payload = {
        arabic: document.getElementById('officerHadithArabic')?.value.trim() || '',
        english: document.getElementById('officerHadithEnglish')?.value.trim() || '',
        reference: document.getElementById('officerHadithReference')?.value.trim() || '',
        source: document.getElementById('officerHadithSource')?.value.trim() || '',
        category: document.getElementById('officerHadithCategory')?.value.trim() || '',
        verification_status: document.getElementById('officerHadithVerificationStatus')?.value || 'needs_verification'
    };

    if (!payload.arabic || !payload.english) {
        showNotification('Arabic and English texts are required.', 'warning');
        return;
    }

    if (frontendOnly) {
        const hadiths = readList('adminHadiths');
        hadiths.unshift({ id: Date.now(), ...payload, created_at: new Date().toISOString() });
        localStorage.setItem('adminHadiths', JSON.stringify(hadiths));
        document.getElementById('officerHadithForm')?.reset();
        loadOfficerHadiths();
        initializeHadiths();
        showNotification('Hadith added successfully.', 'success');
        return;
    }

    fetch('firestore-disabled-endpoint?action=addHadith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(authPayload(payload))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not add hadith');
        document.getElementById('officerHadithForm')?.reset();
        loadOfficerHadiths();
        initializeHadiths();
        showNotification('Hadith added successfully.', 'success');
    })
    .catch(error => showNotification(error.message || 'Could not add hadith', 'danger'));
}
