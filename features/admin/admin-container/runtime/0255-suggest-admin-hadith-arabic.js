// Runtime slice from admin.js: suggestAdminHadithArabic.
function suggestAdminHadithArabic() {
    const english = document.getElementById('hadithEnglish')?.value.trim() || '';
    const reference = document.getElementById('hadithReference')?.value.trim() || '';
    const arabicField = document.getElementById('hadithArabic');
    const button = document.getElementById('adminSuggestArabicBtn');
    const status = document.getElementById('adminArabicSuggestionStatus');
    if (!english) {
        showNotification('Enter the English translation first.', 'warning');
        return;
    }
    const workerUrl = String(window.DAWAAH_AI_WORKER_URL || '').trim();
    if (!workerUrl) {
        showNotification('Arabic suggestion needs the AI Worker configuration.', 'warning');
        return;
    }
    const originalHtml = button?.innerHTML;
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suggesting...';
    }
    if (status) status.textContent = 'Generating Arabic suggestion...';
    const endpoint = `${workerUrl.replace(/\/$/, '')}/hadith-arabic`;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ english, reference })
    };
    const runSuggestionFetch = () => fetch(endpoint, requestOptions);
    const parseSuggestionResponse = response => parseJsonResponse(response);
    runSuggestionFetch()
    .catch(error => {
        if (!/failed to fetch|networkerror|load failed/i.test(error.message || '')) throw error;
        return fetch(`${workerUrl.replace(/\/$/, '')}/health`, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) throw error;
                return runSuggestionFetch();
            })
            .catch(() => {
                throw error;
            });
    })
    .then(parseSuggestionResponse)
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not suggest Arabic');
        if (arabicField) arabicField.value = result.data?.arabic || '';
        if (status) status.textContent = result.data?.warning || 'Review suggested Arabic before saving.';
        showNotification('Arabic suggestion added. Please review it before saving.', 'success');
    })
    .catch(error => {
        const networkMessage = /failed to fetch|networkerror|load failed/i.test(error.message || '')
            ? 'Arabic suggestion could not connect from this cached page. Refresh the main web.app link and try again.'
            : '';
        if (status) status.textContent = networkMessage || 'Arabic suggestion unavailable.';
        showNotification(networkMessage || error.message || 'Could not suggest Arabic', 'danger');
    })
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }
    });
}
