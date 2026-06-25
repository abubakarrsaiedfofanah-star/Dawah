// Runtime slice from daawah.js: loadResearchAssistant.
function loadResearchAssistant() {
    if (!frontendOnly) {
        fetch('supabase-required-endpoint?action=getResearchHistory', { credentials: 'same-origin' })
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
        status.textContent = 'Research can include source links when available. Verify religious rulings with qualified scholars.';
    }
}
