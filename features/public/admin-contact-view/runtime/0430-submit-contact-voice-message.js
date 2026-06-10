// Runtime slice from daawah.js: submitContactVoiceMessage.
function submitContactVoiceMessage(event) {
    event.preventDefault();
    if (frontendOnly) {
        showNotification('Voice messages need the Firebase backend. Please open this through XAMPP/localhost.', 'warning');
        return;
    }

    const voiceFile = getContactVoiceFileForSubmit();
    if (!voiceFile) {
        showNotification('Please record a voice message or upload an audio file.', 'warning');
        return;
    }
    if (!validateUploadFile(voiceFile, 'voice')) {
        return;
    }

    const formData = new FormData();
    formData.append('name', document.getElementById('contactName').value.trim());
    formData.append('email', document.getElementById('contactEmailAddress').value.trim());
    formData.append('subject', document.getElementById('contactSubject').value.trim());
    formData.append('message', document.getElementById('contactMessage').value.trim());
    formData.append('voice_message', voiceFile);

    const button = document.getElementById('contactSubmitButton');
    const originalText = button?.innerHTML;
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }

    fetch('firestore-disabled-endpoint?action=submitContactVoiceMessage', {
        method: 'POST',
        body: formData
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Could not send voice message');
        }
        showNotification('Voice message sent successfully.', 'success');
        resetContactFormAfterSubmit();
    })
    .catch(error => showNotification(error.message || 'Could not send voice message', 'danger'))
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    });
}
