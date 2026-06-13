// Runtime slice from daawah.js: loadAdminGallery.
function loadAdminGallery() {
    const galleryList = document.getElementById('galleryItemsList');
    if (!galleryList) return;

    const galleryRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getGallery'))
        : fetch('admin_supabase-required-endpoint?action=getGallery').then(response => parseJsonResponse(response));

    galleryRequest
    .then(result => {
        let galleryItems = result.data || [];

        if (galleryItems.length === 0) {
        galleryList.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No gallery or video items yet</td></tr>';
            return;
        }

        galleryList.innerHTML = galleryItems.map((item, index) => {
            const imageUrl = item.image_url || item.imageData || item.imageUrl || '';
            const mediaType = item.media_type || getGalleryMediaType(imageUrl);
            const removeId = item.id || index;
            return `
                <tr>
                    <td>${item.title}</td>
                    <td>${item.description || ''}</td>
                    <td>${imageUrl ? (mediaType === 'video' ? `<video src="${resolveAppUrl(imageUrl)}" style="max-height:80px; max-width:120px; object-fit:cover; border-radius:6px;" muted></video>` : `<img src="${resolveAppUrl(imageUrl)}" alt="${item.title}" style="max-height:80px; max-width:120px; object-fit:cover; border-radius:6px;">`) : '<span class="text-muted">No media</span>'}</td>
                    <td><i class="${mediaType === 'video' ? 'fas fa-video' : (item.icon || 'fas fa-images')}"></i></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="removeGalleryItem(${removeId})">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    })
    .catch(error => {
        console.error('Error loading gallery:', error);
        galleryList.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading gallery items</td></tr>';
    });
}
