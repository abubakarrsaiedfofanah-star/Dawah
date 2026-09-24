// Runtime slice from admin.js: removeFinanceSignatureImage.
function removeFinanceSignatureImage() {
    if (!currentAdmin?.isMainAdmin) {
        showNotification('Only the main admin can change the official Imam signature.', 'warning');
        return;
    }
    const input = document.getElementById('adminFinanceSignatureImageFile');
    const hidden = document.getElementById('adminFinanceSignatureImage');
    if (input) input.value = '';
    if (hidden) hidden.value = '';
    updateFinanceSignaturePreview('');
}
