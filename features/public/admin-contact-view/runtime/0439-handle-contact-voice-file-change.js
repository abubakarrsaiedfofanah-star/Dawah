// Runtime slice from daawah.js: handleContactVoiceFileChange.
function handleContactVoiceFileChange(event) {
    const file = event.target.files?.[0];
    contactVoiceBlob = null;
    if (!file) {
        clearContactVoiceRecording();
        return;
    }
    if (!validateUploadFile(file, 'voice')) {
        event.target.value = '';
        clearContactVoiceRecording();
        return;
    }
    showContactVoicePreview(file);
    document.getElementById('clearVoiceRecording').disabled = false;
    setVoiceRecordingStatus('Audio file ready. You can play it before sending.', 'success');
}
