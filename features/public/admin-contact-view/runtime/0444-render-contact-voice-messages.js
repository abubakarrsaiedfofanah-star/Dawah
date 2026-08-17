// Runtime slice from daawah.js: renderContactVoiceMessages.
function renderContactVoiceMessages(messages) {
    const container = document.getElementById('contactVoiceMessagesList');
    if (!container) return;
    if (!messages.length) {
        container.innerHTML = '<p class="text-muted mb-0">No voice messages yet.</p>';
        return;
    }

    container.innerHTML = messages.map(message => `
        <div class="voice-inbox-item">
            <div class="voice-inbox-item__header">
                <div>
                    <h6>${escapeHtml(message.subject)}</h6>
                    <p class="text-muted mb-1">${escapeHtml(message.name)} &lt;${escapeHtml(message.email)}&gt;</p>
                    <p class="text-muted mb-0">${message.created_at ? new Date(message.created_at).toLocaleString() : ''}</p>
                </div>
                <span class="badge bg-${message.status === 'read' ? 'success' : 'warning'}">${message.status === 'read' ? 'Listened' : 'New'}</span>
            </div>
            ${message.message ? `<p class="mt-2 mb-2">${escapeHtml(message.message)}</p>` : ''}
            <audio class="w-100 contact-voice-audio" controls data-message-id="${Number(message.id)}" src="${resolveAppUrl(message.audio_path)}"></audio>
        </div>
    `).join('');

    container.querySelectorAll('.contact-voice-audio').forEach(audio => {
        audio.addEventListener('play', () => markContactVoiceMessageRead(audio.dataset.messageId));
    });
}
