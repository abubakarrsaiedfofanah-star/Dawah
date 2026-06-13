// Runtime slice from daawah.js: clearResearchHistory.
function clearResearchHistory() {
    const history = getResearchHistory();
    if (!history.length) {
        showNotification('No research history to clear.', 'info');
        return;
    }
    if (!confirm('Delete all research history from this device?')) return;
    localStorage.removeItem('studentResearchHistory');
    latestResearchItem = null;
    clearResearchPhoto();
    const result = document.getElementById('researchResult');
    if (result) result.innerHTML = '<p class="text-muted mb-0">Your research answer will appear here.</p>';
    renderResearchHistory();
    showNotification('Research history cleared.', 'success');
}
