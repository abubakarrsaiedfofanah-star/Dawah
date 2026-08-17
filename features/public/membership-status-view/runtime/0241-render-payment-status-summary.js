// Runtime slice from daawah.js: renderPaymentStatusSummary.
function renderPaymentStatusSummary() {
    const statusContainer = document.getElementById('paymentStatusSummary');
    const summaryContainer = document.getElementById('paymentSummaryDetails');
    const completedPayments = payments.filter(payment => payment.status === 'Completed');
    const totalPaid = completedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    if (statusContainer) {
        if (!completedPayments.length) {
            statusContainer.innerHTML = '<p class="text-muted mb-0">No payment has been made yet.</p>';
        } else {
            statusContainer.innerHTML = completedPayments.map(payment => `
                <div class="payment-status-item">
                    <p><strong>${formatPaymentType(payment.type)}</strong></p>
                    <div class="progress mb-2">
                        <div class="progress-bar bg-success" style="width: 100%">Paid</div>
                    </div>
                    <small class="text-muted">Amount: KSh ${payment.amount} | Paid: ${payment.date} | ${payment.paymentMethod || 'Method not specified'}</small>
                </div>
            `).join('<hr>');
        }
    }

    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <table class="table table-borderless">
                <tr>
                    <td><strong>Total Due:</strong></td>
                    <td>${completedPayments.length ? 'KSh 0' : 'Not paid yet'}</td>
                </tr>
                <tr>
                    <td><strong>Total Paid:</strong></td>
                    <td>KSh ${totalPaid.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>Next Due Date:</strong></td>
                    <td>Not set</td>
                </tr>
            </table>
            <button class="btn btn-primary w-100" onclick="showPaymentModal()">Make Payment</button>
        `;
    }
}
