// Runtime slice from admin.js: markAdminContactVoiceMessageRead.
function markAdminContactVoiceMessageRead(messageId) {
    if (!messageId) return;
    fetch(`${API_URL}?action=markContactVoiceMessageRead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: Number(messageId) })
    }).catch(() => {});
}
