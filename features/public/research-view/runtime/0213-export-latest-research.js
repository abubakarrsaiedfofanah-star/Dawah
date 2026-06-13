// Runtime slice from daawah.js: exportLatestResearch.
function exportLatestResearch() {
    const item = latestResearchItem;
    if (!item) {
        alert('No research result to export yet.');
        return;
    }
    const sources = (item.sources || []).map((source, index) => `${index + 1}. ${source.title || source.url}\n${source.url}`).join('\n\n');
    const text = `UMMA University Dawah Team Research Assistant\n\nQuestion:\n${item.question}\n\nMode: ${item.mode}\nDate: ${new Date(item.createdAt || Date.now()).toLocaleString()}\n\nAnswer:\n${item.answer}\n\nSources:\n${sources || 'No sources returned.'}\n`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
