// Runtime slice from daawah.js: stopContactVoiceStream.
function stopContactVoiceStream() {
    if (!contactVoiceStream) return;
    contactVoiceStream.getTracks().forEach(track => track.stop());
    contactVoiceStream = null;
}
