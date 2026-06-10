// Runtime slice from daawah.js: saveDonationLocally.
function saveDonationLocally(donation) {
    donations.push(donation);
    localStorage.setItem('donations', JSON.stringify(donations));
    saveOwnedCloudRecord('donations', donation, 'donations');
    const sendProof = confirm('Donation submitted. The treasurer must confirm it before a receipt is available.\n\nDo you want to send proof screenshot by WhatsApp now?');
    if (sendProof) {
        const message = `Assalamu alaikum Treasurer, donation proof from ${donation.donor || 'Donor'}. Reference: ${donation.transactionRef}. Amount: KSh ${donation.amount}.`;
        window.open(getTreasurerWhatsappUrl(message), '_blank', 'noopener');
    }

    document.getElementById('donationForm').reset();
    updatePaymentInstructions('donation');
    bootstrap.Modal.getInstance(document.getElementById('donationModal')).hide();
    renderDonationHistory();
}
