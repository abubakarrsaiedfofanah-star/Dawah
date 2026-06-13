// Runtime slice from daawah.js: showDonationModal.
function showDonationModal(donationType) {
    document.getElementById('donationModalTitle').textContent = 'Make ' + donationType + ' Donation';
    updatePaymentInstructions('donation');
    const modal = new bootstrap.Modal(document.getElementById('donationModal'));
    modal.show();
}
