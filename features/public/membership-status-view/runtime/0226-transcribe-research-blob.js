// Runtime slice from daawah.js: transcribeResearchBlob.
function transcribeResearchBlob(blob, filename) {
    if (frontendOnly) {
        showNotification('Voice research is not available right now. Please type your question instead.', 'warning');
        return;
    }
    if (blob.size > uploadLimits.voice.bytes) {
        showNotification(`Voice file must be ${uploadLimits.voice.label} or smaller.`, 'warning');
        return;
    }
    const status = document.getElementById('researchStatus');
    if (status) status.textContent = `Uploading voice question (${Math.max(1, Math.round(blob.size / 1024))} KB)...`;
    const formData = new FormData();
    formData.append('audio', blob, filename);
    fetch('supabase-required-endpoint?action=transcribeResearchAudio', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not transcribe audio');
        const field = document.getElementById('researchQuestion');
        if (field) field.value = result.data?.text || '';
        if (status) status.textContent = 'Transcript ready. Review or edit it, then click Research.';
        showNotification('Voice question transcribed.', 'success');
    })
    .catch(error => {
        if (status) status.textContent = 'Voice transcription unavailable.';
        showNotification(error.message || 'Could not transcribe audio', 'danger');
    });
}

// WELFARE
