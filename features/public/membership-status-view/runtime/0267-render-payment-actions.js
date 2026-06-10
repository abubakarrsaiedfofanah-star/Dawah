// Runtime slice from daawah.js: renderPaymentActions.
function renderPaymentActions(payment, index) {
    if (payment.status === 'Completed') {
        return `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="downloadReceipt(${index})">Download</button>
                <button class="btn btn-outline-success" onclick="verifyFinanceReceipt('payments', ${index})">Verify</button>
                <button class="btn btn-outline-secondary" onclick="resendFinanceReceipt('payments', ${index})">Resend</button>
            </div>
        `;
    }
    if (['Failed', 'Rejected', 'Late', 'Waived'].includes(payment.status)) {
        return `<span class="text-muted">${payment.status}</span>`;
    }
    if (hasPermission('manage_payments')) {
        return `
            <button class="btn btn-sm btn-outline-primary" onclick="reviewPayment(${index})">Review</button>
            <button class="btn btn-sm btn-success" onclick="confirmPayment(${index})">Approve</button>
            <button class="btn btn-sm btn-outline-danger" onclick="rejectPayment(${index})">Reject</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="waivePayment(${index})">Waive</button>
        `;
    }
    return '<span class="text-muted">Pending approval</span>';
}
