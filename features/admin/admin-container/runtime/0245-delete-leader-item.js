// Runtime slice from admin.js: deleteLeaderItem.
function deleteLeaderItem(leaderId) {
    if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
        showNotification('Only the main admin can manage leadership.', 'warning');
        return;
    }

    if (!confirm('Delete this leadership member?')) return;
    
    fetch(`${API_URL}?action=deleteLeader`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leader_id: leaderId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Leader deleted!', 'success');
            loadLeadership();
            loadLeadershipCount();
        } else {
            showNotification('Error deleting leader', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error deleting leader', 'danger');
    });
}
