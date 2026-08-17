// Runtime slice from daawah.js: renderResearchResult.
function renderResearchResult(item) {
    const container = document.getElementById('researchResult');
    if (!container) return;
    latestResearchItem = item;
    const sources = Array.isArray(item.sources) ? item.sources.filter(source => source?.url) : [];
    container.innerHTML = `
        <div class="mb-3">
            <span class="badge bg-primary">${escapeHtml(item.mode || 'research')}</span>
            ${item.model ? `<span class="badge bg-secondary">${escapeHtml(item.model)}</span>` : ''}
        </div>
        <h6>${escapeHtml(item.question || '')}</h6>
        ${item.fallback ? '<div class="alert alert-info py-2">This is a basic fallback answer because the live AI research service is unavailable. Add OpenAI quota for full AI research.</div>' : ''}
        <div class="alert alert-warning py-2">
            AI research can contain mistakes. Check the sources, and verify Islamic rulings with qualified scholars before relying on them.
        </div>
        <div class="research-answer">${escapeHtml(item.answer || '').replace(/\n/g, '<br>')}</div>
        ${sources.length ? `<p class="small text-muted mt-3 mb-2">${sources.length} source(s) attached. Open sources before using the answer officially.</p>` : '<p class="small text-muted mt-3 mb-2">No live source link was returned for this answer.</p>'}
        ${renderResearchSources(sources)}
    `;
}
