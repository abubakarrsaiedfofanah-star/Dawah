// Runtime slice from daawah.js: renderDonationActions.
function renderDonationActions(donation, index) {
    if (donation.status === 'Completed') {
        return `
            <div class="finance-history-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="downloadDonationReceipt(${index})"><i class="fas fa-download" aria-hidden="true"></i> Download</button>
                <button class="btn btn-sm btn-outline-success" onclick="verifyFinanceReceipt('donations', ${index})"><i class="fas fa-shield-halved" aria-hidden="true"></i> Verify</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="resendFinanceReceipt('donations', ${index})"><i class="fas fa-share" aria-hidden="true"></i> Resend</button>
            </div>
        `;
    }
    if (['Failed', 'Rejected'].includes(donation.status)) {
        return `<span class="text-muted">${donation.status}</span>`;
    }
    if (hasPermission('manage_payments')) {
        return `
            <div class="finance-history-actions">
                <button class="btn btn-sm btn-success" onclick="confirmDonation(${index})">Confirm</button>
                <button class="btn btn-sm btn-outline-danger" onclick="rejectDonation(${index})">Reject</button>
            </div>
        `;
    }
    return '<span class="text-muted">Pending approval</span>';
}
