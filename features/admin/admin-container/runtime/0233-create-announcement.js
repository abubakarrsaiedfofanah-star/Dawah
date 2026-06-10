// Runtime slice from admin.js: createAnnouncement.
function createAnnouncement() {
    const title = document.getElementById('announcementTitle').value.trim();
    const content = document.getElementById('announcementContent').value.trim();
    const priority = document.getElementById('announcementPriority').value;
    const expires = document.getElementById('announcementExpires').value;
    
    if (!title || !content) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    const data = {
        title: title,
        content: content,
        priority: priority,
        author_id: currentAdmin.id || 1,
        expires_at: expires ? expires.replace('T', ' ') : null
    };
    
    fetch(`${API_URL}?action=createAnnouncement`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Announcement created successfully!', 'success');
            document.getElementById('announcementTitle').value = '';
            document.getElementById('announcementContent').value = '';
            document.getElementById('announcementExpires').value = '';
            loadAnnouncements();
            loadAnnouncementCount();
        } else {
            showNotification('Error creating announcement: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error creating announcement', 'danger');
    });
}
