// Runtime slice from daawah.js: clearContactVoiceRecording.
function clearContactVoiceRecording(resetStatus = true) {
    if (contactVoiceRecorder && contactVoiceRecorder.state === 'recording') {
        contactVoiceRecorder.stop();
    }
    stopContactVoiceStream();
    contactVoiceRecorder = null;
    contactVoiceChunks = [];
    contactVoiceBlob = null;
    const preview = document.getElementById('voiceRecordingPreview');
    if (preview) {
        if (preview.src) URL.revokeObjectURL(preview.src);
        preview.removeAttribute('src');
        preview.classList.add('d-none');
    }
    const fileInput = document.getElementById('contactVoiceFile');
    if (fileInput) fileInput.value = '';
    document.getElementById('startVoiceRecording').disabled = false;
    document.getElementById('stopVoiceRecording').disabled = true;
    document.getElementById('clearVoiceRecording').disabled = true;
    if (resetStatus) {
        setVoiceRecordingStatus('Record a voice message or upload an audio file below.');
    }
}
