// Runtime slice from admin.js: loadWelfareRequests.
function loadWelfareRequests() {
    Promise.all([
        fetch(`${API_URL}?action=getWelfareRequests`).then(response => parseJsonResponse(response)).catch(() => ({ success: false, data: [] })),
        loadAdminStudentRequesters()
    ])
    .then(([result]) => {
        renderWelfareRequests(mergeWelfareRequestsForAdmin(result.data || [], readStore('welfareRequests')));
    });
}
