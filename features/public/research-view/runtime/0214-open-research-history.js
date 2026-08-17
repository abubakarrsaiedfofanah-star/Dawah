// Runtime slice from daawah.js: openResearchHistory.
function openResearchHistory(id) {
    const item = getResearchHistory().find(entry => Number(entry.id) === Number(id));
    if (item) renderResearchResult(item);
}
