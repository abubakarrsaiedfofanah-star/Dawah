// Runtime slice from daawah.js: syncTreasurerDonationRecords.
function syncTreasurerDonationRecords() {
    if (frontendOnly || !hasPermission('manage_payments')) return;
    fetch(`supabase-required-endpoint?action=getDonationRecords&${authQuery()}`)
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success || !Array.isArray(result.data)) return;
            const remoteDonations = result.data.map(row => ({
                dbDonationId: Number(row.id),
                type: row.donation_type || 'Donation',
                purpose: row.purpose || "UMMA University Dawah Team donation",
                amount: row.amount,
                date: row.created_at ? new Date(row.created_at.replace(' ', 'T')).toLocaleDateString() : 'Recently',
                paymentMethod: row.payment_method || 'Not specified',
                transactionRef: row.transaction_id || '',
                status: toDisplayStatus(row.status),
                anonymous: false,
                donor: row.donor_name || row.donor_email || 'Donor',
                proofUrl: row.proof_url || '',
                proofMethod: row.proof_url ? 'Proof link/file' : 'Reference only',
                receiptNumber: row.receipt_number || row.transaction_id || '',
                approvedBy: row.approved_by || '',
                approvedAt: row.approved_at || ''
            }));
            donations = mergeByDatabaseId(donations, remoteDonations, 'dbDonationId');
            localStorage.setItem('donations', JSON.stringify(donations));
            renderDonationHistory();
        })
        .catch(error => console.error('Donation records sync error:', error));
}
