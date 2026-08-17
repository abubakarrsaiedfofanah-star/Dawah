// Runtime slice from admin.js: updateFinanceSignaturePreview.
function updateFinanceSignaturePreview(value = '') {
    const preview = document.getElementById('adminFinanceSignaturePreview');
    const empty = document.getElementById('adminFinanceSignatureEmpty');
    if (!preview || !empty) return;
    if (value) {
        preview.src = value;
        preview.classList.remove('d-none');
        empty.classList.add('d-none');
    } else {
        preview.removeAttribute('src');
        preview.classList.add('d-none');
        empty.classList.remove('d-none');
    }
}
