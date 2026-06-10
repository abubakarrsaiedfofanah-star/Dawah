// Runtime slice from daawah.js: setVoiceRecordingStatus.
function setVoiceRecordingStatus(message, type = 'muted') {
    const status = document.getElementById('voiceRecordingStatus');
    if (!status) return;
    status.textContent = message;
    status.className = `small mt-2 text-${type}`;
}
