// Runtime slice from admin.js: loadGallery.
function loadGallery() {
    fetch(`${API_URL}?action=getGallery`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('galleryList');
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p class="text-muted">No gallery items yet.</p>';
            return;
        }
        
        container.innerHTML = result.data.map(item => {
            const mediaType = item.media_type || getGalleryMediaType(item.image_url || item.imageData || item.imageUrl || '');
            const mediaUrl = resolveAdminUrl(item.image_url || item.imageData || item.imageUrl || '');
            return `
            <div class="item-card">
                <div style="width: 60px; height: 60px; margin-right: 15px; overflow: hidden; border-radius: 5px; flex-shrink: 0;">
                    ${mediaType === 'video'
                        ? `<video src="${mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;" muted></video>`
                        : `<img src="${mediaUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">`}
                </div>
                <div class="item-info flex-grow-1">
                    <h5>${item.title}</h5>
                    <p>${item.description || 'No description'}</p>
                    <small class="text-muted">${mediaType === 'video' ? 'Video' : 'Image'} - ${new Date(item.created_at).toLocaleDateString()}</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGalleryItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        }).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('galleryList').innerHTML = '<p class="text-danger">Error loading gallery items</p>';
    });
}
