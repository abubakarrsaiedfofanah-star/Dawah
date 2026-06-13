// Runtime slice from daawah.js: stopContactVoiceRecording.
function stopContactVoiceRecording() {
    if (contactVoiceRecorder && contactVoiceRecorder.state === 'recording') {
        contactVoiceRecorder.stop();
    }
    document.getElementById('startVoiceRecording').disabled = false;
    document.getElementById('stopVoiceRecording').disabled = true;
    document.getElementById('clearVoiceRecording').disabled = false;
}
