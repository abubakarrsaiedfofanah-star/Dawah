// Runtime slice from admin.js: removeFinanceSignatureImage.
function removeFinanceSignatureImage() {
    const input = document.getElementById('adminFinanceSignatureImageFile');
    const hidden = document.getElementById('adminFinanceSignatureImage');
    if (input) input.value = '';
    if (hidden) hidden.value = '';
    updateFinanceSignaturePreview('');
}
