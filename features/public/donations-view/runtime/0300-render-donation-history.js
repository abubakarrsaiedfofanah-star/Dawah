// Runtime slice from daawah.js: renderDonationHistory.
function renderDonationHistory() {
    const tbody = document.getElementById('donationHistoryList');
    if (!tbody) return;

    notifyFinanceStatusChanges('donations', donations);
    const controls = document.getElementById('donationReviewControls');
    if (controls) controls.classList.toggle('d-none', !hasPermission('manage_payments') && donations.length < 2);
    renderFinanceSummary('donationFinanceSummary', donations);
    const statusFilter = document.getElementById('donationStatusFilter')?.value || 'all';
    const search = document.getElementById('donationSearchInput')?.value || '';
    const visibleDonations = sortTransactions(donations.map((donation, index) => ({ ...donation, originalIndex: index })))
        .filter(donation => transactionMatchesFilter(donation, search, statusFilter));

    if (donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No donations made yet.</td></tr>';
        return;
    }

    if (visibleDonations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No matching donations found.</td></tr>';
        return;
    }

    tbody.innerHTML = visibleDonations.map((donation) => `
        <tr>
            <td>${donation.date || 'Recently'}</td>
            <td>${donation.type || 'Donation'}${donation.donor ? `<br><small class="text-muted">${escapeHtml(donation.donor)}</small>` : ''}</td>
            <td>KSh ${donation.amount}</td>
            <td>${donation.purpose || "UMMA University Dawah Team donation"}</td>
            <td>${donation.paymentMethod || 'Not specified'}${donation.transactionRef ? `<br><small class="text-muted">${escapeHtml(donation.transactionRef)}</small>` : ''}${renderProofLink(donation.proofUrl)}</td>
            <td><span class="badge ${statusBadgeClass(donation.status)}">${donation.status || 'Pending Approval'}</span></td>
            <td>${renderDonationActions(donation, donation.originalIndex)}</td>
        </tr>
    `).join('');
}
