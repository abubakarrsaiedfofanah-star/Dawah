// Runtime slice from daawah.js: initializeCharts.
function initializeCharts() {
    // Membership Chart
    const membershipCtx = document.getElementById('membershipChart');
    if (membershipCtx) {
        if (window.membershipReportChart) window.membershipReportChart.destroy();
        const active = allMembers.filter(member => String(member.status || '').toLowerCase() === 'active').length;
        const pending = allMembers.filter(member => String(member.status || '').toLowerCase() === 'pending').length;
        const inactive = Math.max(0, allMembers.length - active - pending);
        window.membershipReportChart = new Chart(membershipCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Inactive', 'Pending'],
                datasets: [{
                    data: [active, inactive, pending],
                    backgroundColor: ['#40b050', '#0060b0', '#78d986']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Donation Chart
    const donationCtx = document.getElementById('donationChart');
    if (donationCtx) {
        if (window.donationReportChart) window.donationReportChart.destroy();
        const donationTotals = donations.reduce((totals, donation) => {
            const key = donation.type || donation.donation_type || 'General Donation';
            totals[key] = (totals[key] || 0) + Number(donation.amount || 0);
            return totals;
        }, {});
        const labels = Object.keys(donationTotals);
        const values = labels.map(label => donationTotals[label]);
        window.donationReportChart = new Chart(donationCtx, {
            type: 'pie',
            data: {
                labels: labels.length ? labels : ['No donations yet'],
                datasets: [{
                    data: values.length ? values : [1],
                    backgroundColor: ['#003040', '#0060b0', '#40b050']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

const WORKSPACE_SETTINGS_KEY = 'dawaahWorkspaceSettings';
const DEFAULT_WORKSPACE_SETTINGS = {
    aiChatEnabled: true,
    researchHistory: true,
    researchMode: 'groq_chat',
    browserNotifications: false,
    compactDashboard: false,
    reducedMotion: false
};
