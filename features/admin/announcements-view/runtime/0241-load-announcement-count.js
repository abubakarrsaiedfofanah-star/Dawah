// Runtime slice from admin.js: loadAnnouncementCount.
function loadAnnouncementCount() {
    fetch(`${API_URL}?action=getAnnouncements`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        document.getElementById('announcementCount').textContent = (result.data || []).length;
    })
    .catch(error => console.error('Error:', error));
}

// ============================================
// EVENT FUNCTIONS
// ============================================
