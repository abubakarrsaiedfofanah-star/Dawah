// Runtime slice from daawah.js: refreshPaymentMethodAvailability.
function refreshPaymentMethodAvailability() {
    ['paymentMethod', 'donationPaymentMethod'].forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        const option = Array.from(select.options).find(item => item.value === 'mpesaStk');
        if (!option) return;
        option.disabled = !canUseMpesaStk();
        option.textContent = canUseMpesaStk() ? 'M-Pesa STK Push' : 'M-Pesa STK Push (not available here)';
        if (option.disabled && select.value === 'mpesaStk') {
            select.value = '';
            updatePaymentInstructions(selectId === 'donationPaymentMethod' ? 'donation' : 'payment');
        }
    });
}
