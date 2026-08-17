// Runtime slice from admin.js: addHadith.
function addHadith() {
    const arabic = document.getElementById('hadithArabic').value.trim();
    const english = document.getElementById('hadithEnglish').value.trim();
    const reference = document.getElementById('hadithReference').value.trim();
    const source = document.getElementById('hadithSource').value.trim();
    const category = document.getElementById('hadithCategory').value.trim();
    const verificationStatus = document.getElementById('hadithVerificationStatus')?.value || 'needs_verification';
    
    if (!arabic || !english) {
        showNotification('Arabic and English texts are required', 'warning');
        return;
    }
    
    const data = {
        arabic: arabic,
        english: english,
        reference: reference,
        source: source,
        category: category,
        verification_status: verificationStatus,
        added_by: currentAdmin.id || 1
    };
    
    fetch(`${API_URL}?action=addHadith`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Hadith added successfully!', 'success');
            document.getElementById('hadithArabic').value = '';
            document.getElementById('hadithEnglish').value = '';
            document.getElementById('hadithReference').value = '';
            document.getElementById('hadithSource').value = '';
            document.getElementById('hadithCategory').value = '';
            if (document.getElementById('hadithVerificationStatus')) document.getElementById('hadithVerificationStatus').value = 'needs_verification';
            loadHadiths();
        } else {
            showNotification('Error adding hadith: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error adding hadith', 'danger');
    });
}
