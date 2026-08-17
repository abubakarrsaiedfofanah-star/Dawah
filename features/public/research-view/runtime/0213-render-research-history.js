// Runtime slice from daawah.js: renderResearchHistory.
function renderResearchHistory() {
    const container = document.getElementById('researchHistory');
    if (!container) return;
    const history = getResearchHistory();
    if (!history.length) {
        container.innerHTML = '<p class="text-muted mb-0">No research saved yet.</p>';
        return;
    }
    container.innerHTML = history.map(item => `
        <div class="border-bottom py-2 d-flex justify-content-between gap-3 align-items-start">
            <div>
                <button type="button" class="btn btn-link p-0 text-start" onclick="openResearchHistory(${Number(item.id)})">${escapeHtml(item.question || 'Research item')}</button>
                <div><small class="text-muted">${new Date(item.createdAt || Date.now()).toLocaleString()} | ${escapeHtml(item.mode || 'research')}</small></div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger flex-shrink-0" onclick="deleteResearchHistoryItem(${Number(item.id)})" title="Delete this research message" aria-label="Delete this research message">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}
