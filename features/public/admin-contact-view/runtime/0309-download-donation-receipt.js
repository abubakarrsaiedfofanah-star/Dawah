// Runtime slice from daawah.js: downloadDonationReceipt.
function downloadDonationReceipt(index) {
    const donation = donations[index];
    if (!donation) return;
    openOfficialReceipt({
        kind: 'Donation',
        receiptNumber: donation.receiptNumber,
        transactionRef: donation.transactionRef,
        name: donation.donor || currentUser?.fullName || currentUser?.name || currentUser?.username || 'Donor',
        type: donation.type || 'Donation',
        purpose: donation.purpose || '',
        appealId: donation.appealId || '',
        appealTitle: donation.appealTitle || '',
        appealReference: donation.appealReference || donation.appealId || '',
        amount: donation.amount,
        method: donation.paymentMethod || 'Not specified',
        status: donation.status,
        date: donation.date || new Date().toLocaleDateString(),
        approvedBy: donation.approvedBy,
        approvedAt: donation.approvedAt
    });
}

// ADMIN FUNCTIONS
