// Runtime slice from daawah.js: loadContactVoiceMessages.
function loadContactVoiceMessages() {
    const container = document.getElementById('contactVoiceMessagesList');
    if (!container) return;
    container.innerHTML = '<p class="text-muted mb-0">Loading voice messages...</p>';

    fetch('firestore-disabled-endpoint?action=getContactVoiceMessages')
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load voice messages');
        }
        renderContactVoiceMessages(result.data || []);
    })
    .catch(error => {
        container.innerHTML = `<p class="text-danger mb-0">${escapeHtml(error.message || 'Could not load voice messages')}</p>`;
    });
}
