// Runtime slice from admin.js: loadLeadershipCount.
function loadLeadershipCount() {
    fetch(`${API_URL}?action=getLeaders`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        document.getElementById('leaderCount').textContent = (result.data || []).length;
    })
    .catch(error => console.error('Error:', error));
}

// ============================================
// GALLERY FUNCTIONS
// ============================================
