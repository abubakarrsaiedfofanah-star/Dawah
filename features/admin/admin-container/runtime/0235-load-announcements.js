// Runtime slice from admin.js: loadAnnouncements.
function loadAnnouncements() {
    fetch(`${API_URL}?action=getAnnouncements`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('announcementsList');
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p class="text-muted">No announcements yet.</p>';
            return;
        }
        
        container.innerHTML = result.data.map(ann => `
            <div class="item-card">
                <div class="item-info flex-grow-1">
                    <h5>${ann.title}</h5>
                    <p><strong>Priority:</strong> <span class="badge bg-${getPriorityColor(ann.priority)}">${ann.priority}</span></p>
                    <p>${ann.content.substring(0, 100)}${ann.content.length > 100 ? '...' : ''}</p>
                    <small class="text-muted">by ${ann.author_name || 'Admin'}</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAnnouncementItem(${ann.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('announcementsList').innerHTML = '<p class="text-danger">Error loading announcements</p>';
    });
}
