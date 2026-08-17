// Runtime slice from daawah.js: setResearchRecordingState.
function setResearchRecordingState(isRecording) {
    const button = document.getElementById('researchRecordBtn');
    const status = document.getElementById('researchStatus');
    if (button) {
        button.classList.toggle('btn-danger', isRecording);
        button.classList.toggle('btn-outline-secondary', !isRecording);
        button.innerHTML = isRecording ? '<i class="fas fa-stop"></i> Stop' : '<i class="fas fa-microphone"></i> Record';
    }
    if (status) status.textContent = isRecording ? 'Recording voice question...' : 'Processing voice question...';
}
