// Runtime slice from daawah.js: getContactVoiceFileForSubmit.
function getContactVoiceFileForSubmit() {
    const uploadedFile = document.getElementById('contactVoiceFile')?.files?.[0];
    if (uploadedFile) return uploadedFile;
    if (!contactVoiceBlob) return null;
    const extension = contactVoiceBlob.type.includes('ogg') ? 'ogg' : contactVoiceBlob.type.includes('mp4') ? 'm4a' : 'webm';
    return new File([contactVoiceBlob], `contact-voice.${extension}`, { type: contactVoiceBlob.type || 'audio/webm' });
}
