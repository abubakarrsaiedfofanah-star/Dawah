// Runtime slice from daawah.js: updatePaymentInstructions.
function updatePaymentInstructions(context) {
    const selectId = context === 'donation' ? 'donationPaymentMethod' : 'paymentMethod';
    const boxId = context === 'donation' ? 'donationPaymentInstructions' : 'paymentInstructions';
    const select = document.getElementById(selectId);
    const box = document.getElementById(boxId);
    if (!select || !box) return;

    const phoneGroupId = context === 'donation' ? 'donationMpesaPhoneGroup' : 'paymentMpesaPhoneGroup';
    const phoneGroup = document.getElementById(phoneGroupId);
    if (phoneGroup) {
        phoneGroup.classList.toggle('d-none', select.value !== 'mpesaStk' || !canUseMpesaStk());
    }
    const referenceGroup = document.getElementById(context === 'donation' ? 'donationReferenceGroup' : 'paymentReferenceGroup');
    const proofGroup = document.getElementById(context === 'donation' ? 'donationProofGroup' : 'paymentProofGroup');
    const proofLinkGroup = document.getElementById(context === 'donation' ? 'donationProofLinkGroup' : 'paymentProofLinkGroup');
    const isStk = select.value === 'mpesaStk';
    referenceGroup?.classList.toggle('d-none', isStk);
    proofGroup?.classList.toggle('d-none', isStk);
    proofLinkGroup?.classList.toggle('d-none', isStk);

    if (select.value === 'mpesaStk' && !canUseMpesaStk()) {
        box.innerHTML = '<strong>M-Pesa STK Push is not available on this server yet.</strong><br>Use Bank Transfer, Normal Transfer, or Cash Payment and the Treasurer can confirm it from the admin panel.';
        box.classList.remove('d-none');
        return;
    }

    const account = paymentAccounts[select.value];
    if (!account) {
        box.classList.add('d-none');
        box.innerHTML = '';
        return;
    }

    const whatsappUrl = getTreasurerWhatsappUrl(`Assalamu alaikum Treasurer, I want to send payment proof for ${currentUser?.studentId || currentUser?.username || 'my record'}.`);
    const proofHelp = `<br><br><strong>Free proof option:</strong> Keep the transaction reference here, then either paste a Google Drive proof link or send the screenshot on <a href="${whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>.`;
    const note = select.value === 'mpesaStk'
        ? 'Receipt is generated only after Safaricom confirms the M-Pesa payment.'
        : 'Enter the real transaction reference. The Treasurer confirms it before a receipt is generated.';
    box.innerHTML = `${account.html}<hr class="my-2"><strong>Important:</strong> ${note}${select.value === 'mpesaStk' ? '' : proofHelp}`;
    box.classList.remove('d-none');
}
