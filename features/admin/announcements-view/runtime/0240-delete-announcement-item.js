// Runtime slice from admin.js: deleteAnnouncementItem.
function deleteAnnouncementItem(announcementId) {
    if (!confirm('Delete this announcement?')) return;
    
    fetch(`${API_URL}?action=deleteAnnouncement`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ announcement_id: announcementId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Announcement deleted!', 'success');
            loadAnnouncements();
            loadAnnouncementCount();
        } else {
            showNotification('Error deleting announcement', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error deleting announcement', 'danger');
    });
}
