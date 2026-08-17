// Runtime slice from daawah.js: startContactVoiceRecording.
async function startContactVoiceRecording() {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setVoiceRecordingStatus('Recording is not supported in this browser. Upload an audio file instead.', 'danger');
        return;
    }

    try {
        clearContactVoiceRecording(false);
        contactVoiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = getSupportedContactVoiceMime();
        contactVoiceRecorder = new MediaRecorder(contactVoiceStream, mimeType ? { mimeType } : undefined);
        contactVoiceChunks = [];

        contactVoiceRecorder.addEventListener('dataavailable', event => {
            if (event.data && event.data.size > 0) {
                contactVoiceChunks.push(event.data);
            }
        });

        contactVoiceRecorder.addEventListener('stop', () => {
            const type = contactVoiceRecorder.mimeType || mimeType || 'audio/webm';
            contactVoiceBlob = new Blob(contactVoiceChunks, { type });
            stopContactVoiceStream();
            showContactVoicePreview(contactVoiceBlob);
            setVoiceRecordingStatus('Voice message ready. You can play it before sending.', 'success');
        });

        contactVoiceRecorder.start();
        document.getElementById('startVoiceRecording').disabled = true;
        document.getElementById('stopVoiceRecording').disabled = false;
        document.getElementById('clearVoiceRecording').disabled = true;
        document.getElementById('contactVoiceFile').value = '';
        setVoiceRecordingStatus('Recording... allow the microphone prompt if your browser asks.', 'danger');
    } catch (error) {
        stopContactVoiceStream();
        const secureHint = location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1'
            ? ' Open the site through localhost or HTTPS, or upload an audio file.'
            : '';
        setVoiceRecordingStatus(`Microphone could not start.${secureHint}`, 'danger');
    }
}
