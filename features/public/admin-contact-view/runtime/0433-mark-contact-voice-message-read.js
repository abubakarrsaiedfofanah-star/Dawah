// Runtime slice from daawah.js: markContactVoiceMessageRead.
function markContactVoiceMessageRead(messageId) {
    if (!messageId) return;
    fetch('firestore-disabled-endpoint?action=markContactVoiceMessageRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: Number(messageId) })
    }).catch(() => {});
}

// GALLERY MANAGEMENT
