// Runtime slice from admin.js: renderNeedsAttentionPanel.
function renderNeedsAttentionPanel() {
    const container = document.getElementById('needsAttentionPanel');
    if (!container) return;

    const pendingPayments = readStore('payments').filter(item => /pending/i.test(item.status || ''));
    const pendingDonations = readStore('donations').filter(item => /pending/i.test(item.status || ''));
    const suspicious = getSuspiciousActivityRecords().slice(0, 20);
    const expiringCards = getExpiringMembershipCards(60);
    const studentFollowUp = getStudentRecords().filter(member => {
        const status = normalizeAdminText(member.status || member.accountStatus);
        const payment = normalizeAdminText(member.membershipPaymentStatus || member.paymentStatus);
        return status.includes('pending') || status.includes('inactive') || status.includes('suspended') || payment.includes('no payment');
    });

    const cards = [
        {
            label: 'Pending Payments',
            count: pendingPayments.length,
            icon: 'fa-money-check',
            tone: pendingPayments.length ? 'warning text-dark' : 'success',
            action: "loadDashboardDetail('payments')"
        },
        {
            label: 'Pending Donations',
            count: pendingDonations.length,
            icon: 'fa-hand-holding-heart',
            tone: pendingDonations.length ? 'warning text-dark' : 'success',
            action: "loadDashboardDetail('donations')"
        },
        {
            label: 'Student Follow-up',
            count: studentFollowUp.length,
            icon: 'fa-user-clock',
            tone: studentFollowUp.length ? 'info text-dark' : 'success',
            action: "loadDashboardDetail('students')"
        },
        {
            label: 'Cards Expiring Soon',
            count: expiringCards.length,
            icon: 'fa-id-card',
            tone: expiringCards.length ? 'warning text-dark' : 'success',
            action: "loadDashboardDetail('students')"
        },
        {
            label: 'Suspicious Attempts',
            count: suspicious.length,
            icon: 'fa-shield-halved',
            tone: suspicious.length ? 'danger' : 'success',
            action: ''
        }
    ];

    container.innerHTML = cards.map(card => `
        <div class="col-12 col-md-6 col-xl">
            <button type="button" class="btn w-100 text-start border bg-white p-3 h-100" ${card.action ? `onclick="${card.action}"` : ''}>
                <div class="d-flex justify-content-between align-items-center gap-2">
                    <span class="fw-semibold"><i class="fas ${card.icon} me-2"></i>${escapeAdminText(card.label)}</span>
                    <span class="badge bg-${card.tone}">${Number(card.count || 0)}</span>
                </div>
            </button>
        </div>
    `).join('');
}
