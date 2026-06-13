// Runtime slice from daawah.js: loadGalleryContent.
function loadGalleryContent() {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;

    const galleryRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getGallery'))
        : fetch('admin_supabase-required-endpoint?action=getGallery').then(response => parseJsonResponse(response));

    galleryRequest
    .then(result => {
        let galleryItems = result.data || [];

        // Fallback to localStorage if no database results
        if (galleryItems.length === 0) {
            galleryItems = readList('galleryItems');
        }

        if (galleryItems.length === 0) {
            galleryContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Gallery items will be added soon.</p>
                </div>
            `;
            return;
        }

        galleryContainer.innerHTML = galleryItems.map(item => {
            const mediaUrl = item.image_url || item.imageData || item.imageUrl || '';
            const mediaType = item.media_type || getGalleryMediaType(mediaUrl);
            return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="gallery-item" onclick="showGalleryImage('${encodeGalleryItem(item)}')">
                    <div class="gallery-image">
                        ${mediaUrl && mediaType === 'video' ? `<video src="${resolveAppUrl(mediaUrl)}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;" muted></video>` : ''}
                        ${mediaUrl && mediaType !== 'video' ? `<img src="${resolveAppUrl(mediaUrl)}" alt="${item.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                        <i class="fas ${mediaType === 'video' ? 'fa-video' : (item.icon || 'fa-images')} fa-4x" ${mediaUrl ? 'style="display: none;"' : ''}></i>
                    </div>
                    <h6>${item.title}</h6>
                    <p class="text-muted">${(item.description || '').substring(0, 50)}${(item.description || '').length > 50 ? '...' : ''}</p>
                </div>
            </div>
        `;
        }).join('');
    })
    .catch(() => {
        // Fallback to localStorage
        const galleryItems = readList('galleryItems');

        if (galleryItems.length === 0) {
            galleryContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Gallery items will be added soon.</p>
                </div>
            `;
            return;
        }

        galleryContainer.innerHTML = galleryItems.map(item => {
            const mediaUrl = item.imageData || item.imageUrl || item.image_url || '';
            const mediaType = item.media_type || getGalleryMediaType(mediaUrl);
            return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="gallery-item" onclick="showGalleryImage('${encodeGalleryItem(item)}')">
                    <div class="gallery-image">
                        ${mediaUrl && mediaType === 'video' ? `<video src="${resolveAppUrl(mediaUrl)}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;" muted></video>` : ''}
                        ${mediaUrl && mediaType !== 'video' ? `<img src="${resolveAppUrl(mediaUrl)}" alt="${item.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                        <i class="fas ${mediaType === 'video' ? 'fa-video' : (item.icon || 'fa-images')} fa-4x" ${mediaUrl ? 'style="display: none;"' : ''}></i>
                    </div>
                    <h6>${item.title}</h6>
                    <p class="text-muted">${(item.description || '').substring(0, 50)}${(item.description || '').length > 50 ? '...' : ''}</p>
                </div>
            </div>
        `;
        }).join('');
    });
}

// PUBLIC LEADERSHIP MANAGEMENT FUNCTIONS
