// Runtime slice from daawah.js: runStudentResearch.
function runStudentResearch() {
    const baseQuestion = document.getElementById('researchQuestion')?.value.trim() || '';
    const question = `${baseQuestion}${getResearchPhotoContext()}`.trim();
    const mode = document.getElementById('researchMode')?.value || 'quick';
    if (!baseQuestion && !getResearchPhotoFile()) {
        showNotification('Type or record a research question first.', 'warning');
        return;
    }
    const workerUrl = String(window.DAWAAH_AI_WORKER_URL || '').trim();
    if (frontendOnly && !workerUrl) {
        showNotification('Research Assistant needs the AI Worker configuration.', 'warning');
        return;
    }
    const endpoint = workerUrl ? `${workerUrl.replace(/\/$/, '')}/chat` : 'supabase-required-endpoint?action=studentResearch';
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            question,
            mode,
            context: `student research dashboard; mode=${mode}; return concise sources and label Islamic evidence separately when relevant`
        })
    };
    if (!workerUrl) {
        requestOptions.credentials = 'same-origin';
    }
    setResearchBusy(true, 'Searching and preparing your answer...');
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
    .catch(error => {
        if (workerUrl && !frontendOnly) {
            return fetch('supabase-required-endpoint?action=studentResearch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ question, mode })
            }).then(response => parseJsonResponse(response));
        }
        throw error;
    })
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Research failed');
        const item = {
            id: Date.now(),
            question,
            mode,
            answer: result.data?.answer || '',
            sources: result.data?.sources || [],
            model: result.data?.model || '',
            fallback: !!result.data?.fallback,
            createdAt: new Date().toISOString()
        };
        renderResearchResult(item);
        saveResearchHistoryItem(item);
        if (!frontendOnly) saveResearchHistoryToServer(item);
        showNotification(item.fallback ? 'Basic research answer prepared. AI quota needs attention for full research.' : 'Research completed.', item.fallback ? 'warning' : 'success');
    })
    .catch(error => {
        showNotification(error.message || 'Research failed', 'danger');
    })
    .finally(() => setResearchBusy(false, 'Research complete. You can edit the question and search again.'));
}
