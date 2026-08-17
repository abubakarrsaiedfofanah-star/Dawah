// Runtime slice from daawah.js: saveResearchHistoryToServer.
function saveResearchHistoryToServer(item) {
    if (!item?.question || !item?.answer) return;
    fetch('supabase-required-endpoint?action=saveResearchHistory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
            question: item.question,
            answer: item.answer,
            mode: item.mode || 'quick',
            model: item.model || '',
            sources: item.sources || [],
            transcript: item.transcript || ''
        })
    }).catch(() => {});
}
