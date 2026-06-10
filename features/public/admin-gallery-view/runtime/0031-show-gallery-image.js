// Runtime slice from daawah.js: showGalleryImage.
function showGalleryImage(encodedOrTitle, description = '', mediaUrl = '', mediaType = 'image') {
    let item = null;
    try {
        item = JSON.parse(decodeURIComponent(encodedOrTitle));
    } catch (error) {
        item = { title: encodedOrTitle, description, media_url: mediaUrl, media_type: mediaType };
    }

    const resolvedMediaUrl = resolveAppUrl(item.media_url || '');
    const resolvedMediaType = item.media_type || getGalleryMediaType(resolvedMediaUrl);
    const modalImage = document.getElementById('galleryModalImage');
    const modalVideo = document.getElementById('galleryModalVideo');

    document.getElementById('galleryModalTitle').textContent = item.title || 'Gallery Item';
    document.getElementById('galleryTitle').textContent = item.title || '';
    document.getElementById('galleryDescription').textContent = item.description || '';

    if (resolvedMediaType === 'video') {
        modalImage.src = '';
        modalImage.classList.add('d-none');
        modalVideo.src = resolvedMediaUrl;
        modalVideo.classList.remove('d-none');
    } else {
        modalVideo.pause();
        modalVideo.removeAttribute('src');
        modalVideo.load();
        modalVideo.classList.add('d-none');
        modalImage.src = resolvedMediaUrl;
        modalImage.classList.remove('d-none');
    }

    const modal = new bootstrap.Modal(document.getElementById('galleryImageModal'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', function() {
    const galleryModal = document.getElementById('galleryImageModal');
    galleryModal?.addEventListener('hidden.bs.modal', function() {
        const modalVideo = document.getElementById('galleryModalVideo');
        if (!modalVideo) return;
        modalVideo.pause();
        modalVideo.removeAttribute('src');
        modalVideo.load();
    });
});

// LOAD DYNAMIC CONTENT FOR LANDING PAGE
