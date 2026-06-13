// Runtime slice from admin.js: rejectDonationRecord.
function rejectDonationRecord(donationId) {
    const notes = prompt('Reason for rejecting this donation:', 'Could not verify received funds.');
    if (notes === null) return;
    fetch(`${API_URL}?action=rejectDonation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId, notes })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reject donation');
        showNotification('Donation rejected.', 'success');
        loadDashboardStats();
        loadDashboardDetail('donations');
    })
    .catch(error => showNotification(error.message, 'danger'));
}
