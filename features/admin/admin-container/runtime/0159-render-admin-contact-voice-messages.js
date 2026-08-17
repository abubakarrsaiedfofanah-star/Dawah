// Runtime slice from admin.js: renderAdminContactVoiceMessages.
function renderAdminContactVoiceMessages(messages) {
    const container = document.getElementById('adminContactVoiceMessagesList');
    if (!container) return;
    if (!messages.length) {
        container.innerHTML = '<p class="text-muted mb-0">No voice messages yet.</p>';
        return;
    }

    container.innerHTML = messages.map(message => `
        <div class="content-card" style="box-shadow:none; border:1px solid #e5e7eb; margin-bottom:12px;">
            <div class="d-flex justify-content-between align-items-start gap-3">
                <div>
                    <h5 class="mb-1">${escapeAdminText(message.subject)}</h5>
                    <p class="text-muted mb-1">${escapeAdminText(message.name)} &lt;${escapeAdminText(message.email)}&gt;</p>
                    <p class="text-muted mb-0">${message.created_at ? new Date(message.created_at).toLocaleString() : ''}</p>
                </div>
                <span class="badge bg-${message.status === 'read' ? 'success' : 'warning'}">${message.status === 'read' ? 'Listened' : 'New'}</span>
            </div>
            ${message.message ? `<p class="mt-2">${escapeAdminText(message.message)}</p>` : ''}
            <audio class="w-100 admin-contact-voice-audio" controls data-message-id="${Number(message.id)}" src="${resolveAdminUrl(message.audio_path)}"></audio>
        </div>
    `).join('');

    container.querySelectorAll('.admin-contact-voice-audio').forEach(audio => {
        audio.addEventListener('play', () => markAdminContactVoiceMessageRead(audio.dataset.messageId));
    });
}
