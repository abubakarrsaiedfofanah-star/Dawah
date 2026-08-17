// Runtime slice from daawah.js: renderDonationActions.
function renderDonationActions(donation, index) {
    if (donation.status === 'Completed') {
        return `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="downloadDonationReceipt(${index})">Download</button>
                <button class="btn btn-outline-success" onclick="verifyFinanceReceipt('donations', ${index})">Verify</button>
            </div>
        `;
    }
    if (['Failed', 'Rejected'].includes(donation.status)) {
        return `<span class="text-muted">${donation.status}</span>`;
    }
    if (hasPermission('manage_payments')) {
        return `
            <button class="btn btn-sm btn-success" onclick="confirmDonation(${index})">Confirm</button>
            <button class="btn btn-sm btn-outline-danger" onclick="rejectDonation(${index})">Reject</button>
        `;
    }
    return '<span class="text-muted">Pending approval</span>';
}
