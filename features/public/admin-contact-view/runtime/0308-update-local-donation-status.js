// Runtime slice from daawah.js: updateLocalDonationStatus.
function updateLocalDonationStatus(index, displayStatus, dbStatus) {
    const donation = donations[index];
    if (!donation) return;
    if (donation.status === 'Completed' && displayStatus !== 'Completed') {
        showNotification('Completed receipts are locked. Ask the main admin to reverse it if needed.', 'warning');
        return;
    }
    const isCompleted = displayStatus === 'Completed';
    const now = new Date().toISOString();
    donations[index] = {
        ...donation,
        status: displayStatus,
        receiptNumber: isCompleted ? (donation.receiptNumber || makeUniqueFinanceReceipt('DRT', donation.id || donation.dbDonationId)) : donation.receiptNumber,
        approvedBy: isCompleted ? getFinanceActorName() : donation.approvedBy,
        approvedAt: isCompleted ? now : donation.approvedAt,
        updatedBy: getFinanceActorName(),
        updatedAt: now,
        auditTrail: appendFinanceAudit(donation, displayStatus.toLowerCase(), `Marked ${displayStatus.toLowerCase()} by ${currentRole || 'treasurer'}`)
    };
    localStorage.setItem('donations', JSON.stringify(donations));
    if (donation.supabaseId && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.updateRecord('donations', donation.supabaseId, {
            status: donations[index].status,
            receiptNumber: donations[index].receiptNumber || '',
            approvedBy: donations[index].approvedBy || '',
            approvedAt: donations[index].approvedAt || '',
            updatedBy: donations[index].updatedBy || '',
            updatedAt: donations[index].updatedAt || '',
            auditTrail: donations[index].auditTrail || []
        }).catch(error => console.error('Supabase donation status update failed:', error));
    }
    if (isCompleted && window.SupabaseBackend?.enabled) {
        window.SupabaseBackend.saveReceiptVerification?.(buildReceiptVerificationPayload('Donation', donations[index])).catch(error => {
            console.error('Receipt verification save failed:', error);
        });
    }
    renderDonationHistory();

    if (!frontendOnly && donation.dbDonationId) {
        fetch('supabase-required-endpoint?action=updateDonationStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authPayload({
                donation_id: donation.dbDonationId,
                status: dbStatus,
                transaction_id: donations[index].receiptNumber
            }))
        }).catch(error => console.error('Donation status update error:', error));
    }
    showNotification(`Donation ${displayStatus.toLowerCase()}.`, 'success');
}
