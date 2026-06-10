// Runtime slice from daawah.js: saveWelfareRequestLocally.
function saveWelfareRequestLocally(request) {
    const existingIndex = welfareRequests.findIndex(item => Number(item.id) === Number(request.id));
    if (existingIndex >= 0) {
        welfareRequests[existingIndex] = { ...welfareRequests[existingIndex], ...request };
    } else {
        welfareRequests.push(request);
    }
    localStorage.setItem('welfareRequests', JSON.stringify(welfareRequests));
    saveOwnedCloudRecord('welfareRequests', request, 'welfareRequests');
    alert('Welfare request submitted successfully!');

    document.getElementById('welfareForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('welfareModal')).hide();
    updateWelfareRequestsList();
    updateDashboardStats();
}
