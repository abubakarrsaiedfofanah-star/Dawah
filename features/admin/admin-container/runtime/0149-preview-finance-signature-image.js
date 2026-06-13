// Runtime slice from admin.js: previewFinanceSignatureImage.
function previewFinanceSignatureImage() {
    const input = document.getElementById('adminFinanceSignatureImageFile');
    const hidden = document.getElementById('adminFinanceSignatureImage');
    const file = input?.files?.[0];
    if (!file || !hidden) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Use a PNG, JPG, or WebP signature image.', 'warning');
        input.value = '';
        return;
    }
    if (file.size > 250 * 1024) {
        showNotification('Signature image must be under 250 KB.', 'warning');
        input.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = event => {
        hidden.value = event.target?.result || '';
        updateFinanceSignaturePreview(hidden.value);
    };
    reader.readAsDataURL(file);
}
