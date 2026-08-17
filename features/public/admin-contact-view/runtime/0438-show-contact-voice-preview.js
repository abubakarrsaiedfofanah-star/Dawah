// Runtime slice from daawah.js: showContactVoicePreview.
function showContactVoicePreview(blobOrFile) {
    const preview = document.getElementById('voiceRecordingPreview');
    if (!preview || !blobOrFile) return;
    if (preview.src) URL.revokeObjectURL(preview.src);
    preview.src = URL.createObjectURL(blobOrFile);
    preview.classList.remove('d-none');
}
