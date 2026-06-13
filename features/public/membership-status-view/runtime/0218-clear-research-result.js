// Runtime slice from daawah.js: clearResearchResult.
function clearResearchResult() {
    latestResearchItem = null;
    const result = document.getElementById('researchResult');
    if (result) result.innerHTML = '<p class="text-muted mb-0">Your research answer will appear here.</p>';
    const status = document.getElementById('researchStatus');
    if (status) status.textContent = 'Result cleared. You can run a new research question.';
    showNotification('Research result cleared.', 'success');
}
