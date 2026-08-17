// Runtime slice from daawah.js: mergeResearchHistory.
function mergeResearchHistory(remoteItems = []) {
    if (!Array.isArray(remoteItems) || !remoteItems.length) return;
    const local = getResearchHistory();
    const mapped = remoteItems.map(item => ({
        id: item.id,
        question: item.question,
        mode: item.mode,
        answer: item.answer,
        sources: item.sources || [],
        model: item.model || '',
        createdAt: item.created_at || item.createdAt || new Date().toISOString()
    }));
    const merged = [...mapped, ...local].filter((item, index, list) =>
        index === list.findIndex(other => String(other.id) === String(item.id) || (other.question === item.question && other.createdAt === item.createdAt))
    );
    localStorage.setItem('studentResearchHistory', JSON.stringify(merged.slice(0, 25)));
}
