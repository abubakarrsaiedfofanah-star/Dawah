// Runtime slice from admin.js: updateAdminPhotoUi.
function updateAdminPhotoUi() {
    const photo = currentAdmin?.profile_photo ? resolveAdminUrl(currentAdmin.profile_photo) : '';
    const headerPhoto = document.getElementById('adminHeaderPhoto');
    const headerIcon = document.getElementById('adminHeaderIcon');
    const preview = document.getElementById('adminPhotoPreview');
    const previewIcon = document.getElementById('adminPhotoPreviewIcon');

    [headerPhoto, preview].forEach(img => {
        if (!img) return;
        img.src = photo;
        img.classList.toggle('d-none', !photo);
    });
    headerIcon?.classList.toggle('d-none', Boolean(photo));
    previewIcon?.classList.toggle('d-none', Boolean(photo));
}
