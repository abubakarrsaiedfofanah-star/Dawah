// Runtime slice from admin.js: updateWelfareStatus.
function updateWelfareStatus(requestId, status) {
    const applyLocalWelfareStatus = () => {
        let matchedRequest = null;
        const requests = readStore('welfareRequests').map(item =>
            Number(item.id) === Number(requestId) ? (matchedRequest = item, { ...item, status: status, statusUpdatedAt: new Date().toISOString() }) : item
        );
        writeStore('welfareRequests', requests);
        if (matchedRequest?.firebaseDocId && window.DawaahCloud?.enabled) {
            window.DawaahCloud.updateRecord('welfareRequests', matchedRequest.firebaseDocId, {
                status: status,
                statusUpdatedAt: new Date().toISOString()
            }).catch(error => {
                console.error('Firestore welfare status update failed:', error);
            });
        }
    };

    fetch(`${API_URL}?action=updateWelfareStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, status: status, notes: '' })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not update request');
        applyLocalWelfareStatus();
        showNotification(`Welfare request ${status.toLowerCase()}.`, 'success');
        loadWelfareRequests();
    })
    .catch(error => {
        applyLocalWelfareStatus();
        showNotification(error.message ? 'Saved status locally because database is unavailable.' : `Welfare request ${status.toLowerCase()}.`, 'warning');
        loadWelfareRequests();
    });
}
