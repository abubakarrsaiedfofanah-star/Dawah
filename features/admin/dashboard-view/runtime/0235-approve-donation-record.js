// Runtime slice from admin.js: approveDonationRecord.
function approveDonationRecord(donationId) {
    if (!confirm('Approve this donation only after confirming the money was received. Continue?')) return;
    fetch(`${API_URL}?action=approveDonation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not approve donation');
        showNotification('Donation approved. Receipt can now be issued.', 'success');
        loadDashboardStats();
        loadDashboardDetail('donations');
    })
    .catch(error => showNotification(error.message, 'danger'));
}
