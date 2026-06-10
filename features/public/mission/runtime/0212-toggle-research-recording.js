// Runtime slice from daawah.js: toggleResearchRecording.
function toggleResearchRecording() {
    if (researchRecorder && researchRecorder.state === 'recording') {
        researchRecorder.stop();
        return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
        showNotification('Voice recording is not supported in this browser.', 'warning');
        return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            researchAudioStream = stream;
            researchAudioChunks = [];
            researchRecorder = new MediaRecorder(stream);
            researchRecorder.ondataavailable = event => {
                if (event.data && event.data.size > 0) researchAudioChunks.push(event.data);
            };
            researchRecorder.onstop = () => {
                setResearchRecordingState(false);
                researchAudioStream?.getTracks().forEach(track => track.stop());
                const blob = new Blob(researchAudioChunks, { type: researchRecorder.mimeType || 'audio/webm' });
                transcribeResearchBlob(blob, 'research-question.webm');
            };
            researchRecorder.start();
            setResearchRecordingState(true);
        })
        .catch(() => showNotification('Microphone permission was not granted.', 'warning'));
}
