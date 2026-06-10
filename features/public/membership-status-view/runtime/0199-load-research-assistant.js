// Runtime slice from daawah.js: loadResearchAssistant.
function loadResearchAssistant() {
    if (!frontendOnly) {
        fetch('firestore-disabled-endpoint?action=getResearchHistory', { credentials: 'same-origin' })
            .then(response => parseJsonResponse(response))
            .then(result => {
                if (result.success) mergeResearchHistory(result.data || []);
                renderResearchHistory();
            })
            .catch(() => renderResearchHistory());
    } else {
        renderResearchHistory();
    }
    const status = document.getElementById('researchStatus');
    if (status) {
        status.textContent = 'Research uses web sources when the server OpenAI key is configured. Verify religious rulings with qualified scholars.';
    }
}
