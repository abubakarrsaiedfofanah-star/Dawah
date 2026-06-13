// Runtime slice from daawah.js: renderPaymentHistory.
function renderPaymentHistory() {
    const tbody = document.getElementById('paymentHistoryList');
    if (!tbody) return;

    notifyFinanceStatusChanges('payments', payments);
    const controls = document.getElementById('paymentReviewControls');
    if (controls) controls.classList.toggle('d-none', !hasPermission('manage_payments') && payments.length < 2);
    renderFinanceSummary('paymentFinanceSummary', payments);
    const statusFilter = document.getElementById('paymentStatusFilter')?.value || 'all';
    const search = document.getElementById('paymentSearchInput')?.value || '';
    const visiblePayments = sortTransactions(payments.map((payment, index) => ({ ...payment, originalIndex: index })))
        .filter(payment => transactionMatchesFilter(payment, search, statusFilter));

    if (payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">${renderEmptyState('fa-receipt', 'No payments yet', 'Payment history will appear here after dues are submitted.')}</td></tr>`;
        return;
    }

    if (visiblePayments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No matching payments found.</td></tr>';
        return;
    }

    tbody.innerHTML = visiblePayments.map((payment) => `
        <tr>
            <td>${payment.date}</td>
            <td>${formatPaymentType(payment.type)}${payment.memberName ? `<br><small class="text-muted">${escapeHtml(payment.memberName)}</small>` : ''}</td>
            <td>KSh ${payment.amount}</td>
            <td>${payment.paymentMethod || 'Not specified'}${payment.transactionRef ? `<br><small class="text-muted">${escapeHtml(payment.transactionRef)}</small>` : ''}${renderProofLink(payment.proofUrl)}</td>
            <td><span class="badge ${statusBadgeClass(payment.status)}">${payment.status}</span></td>
            <td>${renderPaymentActions(payment, payment.originalIndex)}</td>
        </tr>
    `).join('');
}
