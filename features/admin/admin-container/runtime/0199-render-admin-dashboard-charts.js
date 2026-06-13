// Runtime slice from admin.js: renderAdminDashboardCharts.
function renderAdminDashboardCharts(stats = {}) {
    if (typeof Chart === 'undefined') return;
    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
    };
    const memberCtx = document.getElementById('adminMemberStatusChart');
    if (memberCtx) {
        if (typeof window.adminMemberStatusChart?.destroy === 'function') window.adminMemberStatusChart.destroy();
        const members = Number(stats.members || 0);
        const students = Number(stats.students || 0);
        const nonMembers = Math.max(0, students - members);
        window.adminMemberStatusChart = new Chart(memberCtx, {
            type: 'doughnut',
            data: {
                labels: ['Members', 'Students not members'],
                datasets: [{ data: [members, nonMembers], backgroundColor: ['#40b050', '#0060b0'] }]
            },
            options: chartDefaults
        });
    }
    const financeCtx = document.getElementById('adminFinanceStatusChart');
    if (financeCtx) {
        if (typeof window.adminFinanceStatusChart?.destroy === 'function') window.adminFinanceStatusChart.destroy();
        window.adminFinanceStatusChart = new Chart(financeCtx, {
            type: 'bar',
            data: {
                labels: ['Donations', 'Payments'],
                datasets: [
                    {
                        label: 'Received',
                        data: [Number(stats.donation_total || 0), Number(stats.payment_total || 0)],
                        backgroundColor: '#40b050'
                    },
                    {
                        label: 'Pending',
                        data: [Number(stats.pending_donation_amount || 0), Number(stats.pending_payment_amount || 0)],
                        backgroundColor: '#0060b0'
                    }
                ]
            },
            options: { ...chartDefaults, scales: { y: { beginAtZero: true } } }
        });
    }
    const operationsCtx = document.getElementById('adminOperationsChart');
    if (operationsCtx) {
        if (typeof window.adminOperationsChart?.destroy === 'function') window.adminOperationsChart.destroy();
        window.adminOperationsChart = new Chart(operationsCtx, {
            type: 'radar',
            data: {
                labels: ['Events', 'Welfare', 'Resources', 'Gallery', 'Research'],
                datasets: [{
                    label: 'Records',
                    data: [
                        Number(stats.events || 0),
                        Number(stats.welfare_requests || 0),
                        Number(stats.resources || 0),
                        Number(stats.gallery || 0),
                        Number(stats.research || 0)
                    ],
                    borderColor: '#003040',
                    backgroundColor: 'rgba(64, 176, 80, 0.2)'
                }]
            },
            options: chartDefaults
        });
    }
}
