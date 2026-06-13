// Runtime slice from daawah.js: updatePaymentInstructions.
function updatePaymentInstructions(context) {
    const isDonation = context === 'donation';
    const prefix = isDonation ? 'donation' : 'payment';
    const select = document.getElementById(`${prefix}PaymentMethod`);
    const box = document.getElementById(`${prefix}PaymentInstructions`);

    if (!select || !box) return;

    const method = select.value;
    const isStk = method === 'mpesaStk';
    const mpesaAvailable = canUseMpesaStk();

    // Helper to toggle visibility for related UI groups
    const toggle = (id, condition) => {
        document.getElementById(`${prefix}${id}`)?.classList.toggle('d-none', condition);
    };

    toggle('MpesaPhoneGroup', !isStk || !mpesaAvailable);
    toggle('ReferenceGroup', isStk);
    toggle('ProofGroup', isStk);
    toggle('ProofLinkGroup', isStk);

    if (isStk && !mpesaAvailable) {
        box.innerHTML = '<strong>M-Pesa STK Push is not available on this server yet.</strong><br>Use Bank Transfer, Normal Transfer, or Cash Payment and the Treasurer can confirm it from the admin panel.';
        box.classList.remove('d-none');
        return;
    }

    const account = paymentAccounts[method];
    if (!account) {
        box.innerHTML = '';
        box.classList.add('d-none');
        return;
    }

    const userRef = currentUser?.studentId || currentUser?.username || 'my record';
    const whatsappUrl = getTreasurerWhatsappUrl(`Assalamu alaikum Treasurer, I want to send payment proof for ${userRef}.`);
    const note = isStk
        ? 'Receipt is generated only after Safaricom confirms the M-Pesa payment.'
        : 'Enter the real transaction reference. The Treasurer confirms it before a receipt is generated.';

    const proofHelp = isStk ? '' : `<br><br><strong>Free proof option:</strong> Keep the transaction reference here, then either paste a Google Drive proof link or send the screenshot on <a href="${whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>.`;
    
    box.innerHTML = `${account.html}<hr class="my-2"><strong>Important:</strong> ${note}${proofHelp}`;
    box.classList.remove('d-none');
}
