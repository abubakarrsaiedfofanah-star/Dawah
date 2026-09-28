// Runtime slice from daawah.js: showDonationModal.
function showDonationModal(donationType, appeal = null) {
    activeCharityAppeal = appeal?.id ? {
        id: String(appeal.id).slice(0, 120),
        title: String(appeal.title || '').slice(0, 120)
    } : null;
    document.getElementById('donationModalTitle').textContent = activeCharityAppeal ? 'Make Charity Appeal Donation' : 'Make ' + donationType + ' Donation';
    const appealSummary = document.getElementById('donationAppealSummary');
    if (appealSummary) {
        appealSummary.classList.toggle('d-none', !activeCharityAppeal);
        appealSummary.textContent = activeCharityAppeal
            ? `Your donation will support: ${activeCharityAppeal.title} (Appeal reference: ${activeCharityAppeal.id})`
            : '';
    }
    const feedback = document.getElementById('donationFormFeedback');
    if (feedback) { feedback.textContent = ''; feedback.classList.add('d-none'); }
    document.getElementById('donationForm')?.reset();
    toggleDonationIdentity();
    const submitButton = document.getElementById('submitDonationButton');
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Send Donation'; }
    document.getElementById('donationForm')?.classList.remove('was-validated');
    updatePaymentInstructions('donation');
    const modal = new bootstrap.Modal(document.getElementById('donationModal'));
    modal.show();
}

function toggleDonationIdentity() {
    const anonymous = Boolean(document.getElementById('anonymousDonation')?.checked);
    const group = document.getElementById('donationDonorNameGroup');
    const name = document.getElementById('donationDonorName');
    group?.classList.toggle('d-none', anonymous);
    if (name) {
        name.required = !anonymous;
        if (anonymous) name.value = '';
    }
}
