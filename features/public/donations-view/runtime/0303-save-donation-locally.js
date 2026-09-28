// Runtime slice from daawah.js: saveDonationLocally.
function saveDonationLocally(donation) {
    donations.push(donation);
    localStorage.setItem('donations', JSON.stringify(donations));
    if (!donation.supabaseId) saveOwnedCloudRecord('donations', donation, 'donations');
    const campaignNote = donation.appealTitle
        ? ` for “${donation.appealTitle}” (appeal ${donation.appealReference || donation.appealId})`
        : '';
    const sendProof = confirm(`Donation submitted${campaignNote}. Payment reference: ${donation.transactionRef}. It will remain pending until the Treasurer confirms it.\n\nWould you like to send proof by WhatsApp now?`);
    if (sendProof) {
        const appealNote = donation.appealTitle ? ` Appeal: ${donation.appealTitle} (${donation.appealReference || donation.appealId}).` : '';
        const message = `Assalamu alaikum Treasurer, donation proof from ${donation.donor || 'Donor'}.${appealNote} Transaction reference: ${donation.transactionRef}. Amount: KSh ${donation.amount}.`;
        window.open(getTreasurerWhatsappUrl(message), '_blank', 'noopener');
    }

    document.getElementById('donationForm').reset();
    updatePaymentInstructions('donation');
    bootstrap.Modal.getInstance(document.getElementById('donationModal')).hide();
    renderDonationHistory();
    showNotification('Donation submitted. It will show as pending until the Treasurer confirms it.', 'success');
}
