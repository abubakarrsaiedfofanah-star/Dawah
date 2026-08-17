// Runtime slice from admin.js: loadEventCount.
function loadEventCount() {
    fetch(`${API_URL}?action=getEvents`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        document.getElementById('eventCount').textContent = (result.data || []).length;
    })
    .catch(error => console.error('Error:', error));
}

// ============================================
// LEADERSHIP FUNCTIONS
// ============================================
