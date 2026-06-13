// Runtime slice from admin.js: loadGalleryCount.
function loadGalleryCount() {
    fetch(`${API_URL}?action=getGallery`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        document.getElementById('galleryCount').textContent = (result.data || []).length;
    })
    .catch(error => console.error('Error:', error));
}

// ============================================
// HADITH FUNCTIONS
// ============================================
