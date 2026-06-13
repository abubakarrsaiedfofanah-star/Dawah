// Runtime slice from daawah.js: loadDuesData.
function loadDuesData() {
    const duesInfo = {
        amount: 'KSh 50',
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString(),
        status: 'Pending',
        description: 'Annual membership dues'
    };

    const container = document.getElementById('duesDetails');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Dues Payment Information</h5>
                </div>
                <div class="card-body">
                    <p><strong>Amount Due:</strong> ${duesInfo.amount}</p>
                    <p><strong>Due Date:</strong> ${duesInfo.dueDate}</p>
                    <p><strong>Status:</strong> <span class="badge bg-warning">${duesInfo.status}</span></p>
                    <p><strong>Description:</strong> ${duesInfo.description}</p>
                    <button class="btn btn-primary mt-3" onclick="showPaymentModal()">Pay Now</button>
                </div>
            </div>
        `;
    }
    syncTreasurerPaymentRecords();
    renderMpesaReadinessPanel();
    renderPaymentStatusSummary();
    renderPaymentHistory();
}
