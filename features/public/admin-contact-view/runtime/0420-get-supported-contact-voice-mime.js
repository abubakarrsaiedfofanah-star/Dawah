// Runtime slice from daawah.js: getSupportedContactVoiceMime.
function getSupportedContactVoiceMime() {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
        return '';
    }
    return [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4'
    ].find(type => MediaRecorder.isTypeSupported(type)) || '';
}
