// Runtime slice from daawah.js: loadDonationsData.
function loadDonationsData() {
    const donationStats = [
        { name: 'Zakat', amount: 'Open', description: 'Obligatory Charity', color: 'primary' },
        { name: 'Sadaqah', amount: 'Open', description: 'Voluntary Charity', color: 'success' },
        { name: 'Community Fund', amount: 'Open', description: 'Community Support', color: 'info' }
    ];

    const container = document.getElementById('donationStats');
    if (container) {
        container.innerHTML = donationStats.map(stat => `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body text-center">
                        <h6>${stat.name}</h6>
                        <p class="stat-value" style="color: var(--primary-color);">${stat.amount}</p>
                        <p class="text-muted small">${stat.description}</p>
                        <button class="btn btn-sm btn-outline-primary" onclick="showDonationModal('${stat.name}')">Donate</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    syncTreasurerDonationRecords();
    renderDonationHistory();
}
