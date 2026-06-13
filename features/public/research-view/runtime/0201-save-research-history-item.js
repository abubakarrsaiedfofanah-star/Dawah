// Runtime slice from daawah.js: saveResearchHistoryItem.
function saveResearchHistoryItem(item) {
    const history = getResearchHistory();
    history.unshift(item);
    localStorage.setItem('studentResearchHistory', JSON.stringify(history.slice(0, 25)));
    latestResearchItem = item;
    renderResearchHistory();
}
