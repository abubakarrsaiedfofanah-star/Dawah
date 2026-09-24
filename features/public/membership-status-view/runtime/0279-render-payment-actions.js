// Runtime slice from daawah.js: renderPaymentActions.
function renderPaymentActions(payment, index) {
    if (payment.status === 'Completed') {
        return `
            <div class="finance-history-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="downloadReceipt(${index})"><i class="fas fa-download" aria-hidden="true"></i> Download</button>
                <button class="btn btn-sm btn-outline-success" onclick="verifyFinanceReceipt('payments', ${index})"><i class="fas fa-shield-halved" aria-hidden="true"></i> Verify</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="resendFinanceReceipt('payments', ${index})"><i class="fas fa-share" aria-hidden="true"></i> Resend</button>
            </div>
        `;
    }
    if (['Failed', 'Rejected', 'Late', 'Waived'].includes(payment.status)) {
        return `<span class="text-muted">${payment.status}</span>`;
    }
    if (hasPermission('manage_payments')) {
        return `
            <div class="finance-history-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="reviewPayment(${index})">Review</button>
                <button class="btn btn-sm btn-success" onclick="confirmPayment(${index})">Approve</button>
                <button class="btn btn-sm btn-outline-danger" onclick="rejectPayment(${index})">Reject</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="waivePayment(${index})">Waive</button>
            </div>
        `;
    }
    return '<span class="text-muted">Pending approval</span>';
}
