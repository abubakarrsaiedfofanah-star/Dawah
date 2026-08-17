// Runtime slice from daawah.js: deleteResearchHistoryItem.
function deleteResearchHistoryItem(id) {
    const history = getResearchHistory();
    const item = history.find(entry => Number(entry.id) === Number(id));
    if (!item) return;
    if (!confirm('Delete this research message from your history?')) return;
    const next = history.filter(entry => Number(entry.id) !== Number(id));
    localStorage.setItem('studentResearchHistory', JSON.stringify(next));
    if (latestResearchItem && Number(latestResearchItem.id) === Number(id)) {
        latestResearchItem = null;
        const result = document.getElementById('researchResult');
        if (result) result.innerHTML = '<p class="text-muted mb-0">Your research answer will appear here.</p>';
    }
    renderResearchHistory();
    showNotification('Research message deleted.', 'success');
}
