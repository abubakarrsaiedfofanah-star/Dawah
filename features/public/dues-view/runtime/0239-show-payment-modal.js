// Runtime slice from daawah.js: showPaymentModal.
function showPaymentModal(defaultType = '') {
    const typeSelect = document.getElementById('paymentType');
    const amountInput = document.getElementById('paymentAmount');
    if (typeSelect && defaultType) {
        typeSelect.value = defaultType;
    }
    if (amountInput && defaultType === 'membershipDues' && !amountInput.value) {
        amountInput.value = '50';
    }
    updatePaymentInstructions('payment');
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}
