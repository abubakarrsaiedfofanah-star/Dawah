// Runtime slice from admin.js: deleteHadithItem.
function deleteHadithItem(hadithId) {
    if (!confirm('Delete this hadith?')) return;
    
    fetch(`${API_URL}?action=deleteHadith`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hadith_id: hadithId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Hadith deleted!', 'success');
            loadHadiths();
        } else {
            showNotification('Error deleting hadith', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error deleting hadith', 'danger');
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
