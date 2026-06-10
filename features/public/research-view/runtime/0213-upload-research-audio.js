// Runtime slice from daawah.js: uploadResearchAudio.
function uploadResearchAudio() {
    const file = document.getElementById('researchAudioUpload')?.files?.[0];
    if (!file) return;
    transcribeResearchBlob(file, file.name || 'research-audio.webm');
}
