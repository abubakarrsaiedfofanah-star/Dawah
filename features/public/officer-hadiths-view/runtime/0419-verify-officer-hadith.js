// Runtime slice from daawah.js: verifyOfficerHadith.
function verifyOfficerHadith(hadithId, status) {
    if (!hasPermission('manage_hadiths')) {
        showNotification('Only the Amir/Director of Dawah Team can verify hadiths.', 'warning');
        return;
    }
    fetch('supabase-required-endpoint?action=verifyHadith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(authPayload({ hadith_id: Number(hadithId), verification_status: status }))
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not update verification');
        showNotification('Hadith verification updated.', 'success');
        loadOfficerHadiths();
        initializeHadiths();
    })
    .catch(error => showNotification(error.message || 'Could not update verification', 'danger'));
}
