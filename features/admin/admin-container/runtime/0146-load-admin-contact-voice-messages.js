// Runtime slice from admin.js: loadAdminContactVoiceMessages.
function loadAdminContactVoiceMessages() {
    const container = document.getElementById('adminContactVoiceMessagesList');
    if (!container) return;
    container.innerHTML = '<p class="text-muted mb-0">Loading voice messages...</p>';

    fetch(`${API_URL}?action=getContactVoiceMessages`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not load voice messages');
        }
        renderAdminContactVoiceMessages(result.data || []);
    })
    .catch(error => {
        container.innerHTML = `<p class="text-danger mb-0">${escapeAdminText(error.message || 'Could not load voice messages')}</p>`;
    });
}
