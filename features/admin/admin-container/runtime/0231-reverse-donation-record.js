// Runtime slice from admin.js: reverseDonationRecord.
function reverseDonationRecord(donationId) {
    const reason = prompt('Main admin reversal reason:');
    if (!reason) return;
    fetch(`${API_URL}?action=reverseDonation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donation_id: donationId, reason })
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not reverse donation');
        showNotification('Donation reversed and audited.', 'success');
        loadDashboardStats();
        loadDashboardDetail('donations');
    })
    .catch(error => showNotification(error.message, 'danger'));
}
