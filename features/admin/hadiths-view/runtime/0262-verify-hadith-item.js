// Runtime slice from admin.js: verifyHadithItem.
function verifyHadithItem(hadithId, status) {
    fetch(`${API_URL}?action=verifyHadith`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hadith_id: Number(hadithId), verification_status: status })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not update verification');
        showNotification('Hadith verification updated.', 'success');
        loadHadiths();
    })
    .catch(error => showNotification(error.message || 'Could not update verification', 'danger'));
}
