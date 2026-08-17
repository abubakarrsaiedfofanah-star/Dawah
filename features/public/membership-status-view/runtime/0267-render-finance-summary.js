// Runtime slice from daawah.js: renderFinanceSummary.
function renderFinanceSummary(containerId, records) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!hasPermission('manage_payments')) {
        container.innerHTML = '';
        return;
    }
    const completed = records.filter(item => item.status === 'Completed');
    const pending = records.filter(item => ['Pending Approval', 'Pending M-Pesa'].includes(item.status));
    const rejected = records.filter(item => ['Failed', 'Rejected'].includes(item.status));
    const total = completed.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const cards = [
        ['Completed', completed.length, `KSh ${total.toLocaleString()}`],
        ['Pending Review', pending.length, 'Needs confirmation'],
        ['Rejected/Failed', rejected.length, 'Closed items']
    ];
    container.innerHTML = cards.map(([label, value, helper]) => `
        <div class="col-md-4">
            <div class="payment-mini">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${label}</strong>
                    <span>${value}</span>
                </div>
                <small class="text-muted">${helper}</small>
            </div>
        </div>
    `).join('');
}
