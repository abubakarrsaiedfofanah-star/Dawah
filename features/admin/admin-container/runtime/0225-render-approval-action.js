// Runtime slice from admin.js: renderApprovalAction.
function renderApprovalAction(type, row) {
    const status = String(row.status || '').toLowerCase();
    if (status === 'completed') {
        const reverseButton = currentAdmin?.isMainAdmin
            ? `<button class="btn btn-outline-danger" onclick="${type === 'payments' ? 'reversePaymentRecord' : 'reverseDonationRecord'}(${row.id})">Reverse</button>`
            : '';
        return `<div class="btn-group btn-group-sm"><span class="btn btn-success disabled">Approved</span>${reverseButton}</div>`;
    }
    if (status === 'pending_main_approval') {
        if (currentAdmin?.isMainAdmin) {
            return `
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-success" onclick="${type === 'payments' ? 'approvePaymentRecord' : 'approveDonationRecord'}(${row.id})">Final approve</button>
                    <button class="btn btn-outline-danger" onclick="${type === 'payments' ? 'rejectPaymentRecord' : 'rejectDonationRecord'}(${row.id})">Reject</button>
                </div>
            `;
        }
        return '<span class="badge bg-warning text-dark">Needs main admin</span>';
    }
    if (status === 'rejected' || status === 'failed' || status === 'reversed') {
        return `<span class="badge bg-danger">${status === 'failed' ? 'Failed' : status === 'reversed' ? 'Reversed' : 'Rejected'}</span>`;
    }

    if (type === 'payments') {
        return `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-success" onclick="approvePaymentRecord(${row.id})">Approve</button>
                <button class="btn btn-outline-danger" onclick="rejectPaymentRecord(${row.id})">Reject</button>
            </div>
        `;
    }

    if (type === 'donations') {
        return `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-success" onclick="approveDonationRecord(${row.id})">Approve</button>
                <button class="btn btn-outline-danger" onclick="rejectDonationRecord(${row.id})">Reject</button>
            </div>
        `;
    }

    return '-';
}
