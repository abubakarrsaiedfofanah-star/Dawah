// Runtime slice from admin.js: mergeWelfareRequestsForAdmin.
function mergeWelfareRequestsForAdmin(databaseRequests, localRequests) {
    const merged = [...localRequests];
    databaseRequests.forEach(request => {
        const index = merged.findIndex(item => Number(item.id) === Number(request.id));
        if (index >= 0) {
            merged[index] = { ...merged[index], ...request };
        } else {
            merged.push(request);
        }
    });
    return merged.map(enrichWelfareRequestFromMembers).sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
}
