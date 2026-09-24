// Runtime slice from daawah.js: loadReportsData.
function loadReportsData() {
    const canViewMembers = hasPermission('manage_members');
    const canViewFinance = hasPermission('manage_payments');
    const canViewEvents = hasPermission('manage_events');
    const canViewWelfare = hasPermission('manage_welfare');
    const activeMembers = canViewMembers ? allMembers.filter(member => String(member.status || '').toLowerCase() === 'active').length : 0;
    const completedDonations = canViewFinance ? donations
        .filter(donation => String(donation.status || '').toLowerCase() === 'completed')
        .reduce((sum, donation) => sum + Number(donation.amount || 0), 0) : 0;
    const completedEvents = canViewEvents ? allEvents.filter(event => ['completed', 'held'].includes(String(event.status || '').toLowerCase())).length : 0;

    const reportValues = {
        reportTotalMembers: canViewMembers ? allMembers.length : 0,
        reportActiveMembers: activeMembers,
        reportTotalDonations: completedDonations ? formatCurrency(completedDonations) : '0',
        reportEventsHeld: completedEvents
    };

    Object.entries(reportValues).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = String(value);
    });
    const toggleReportPanel = (selector, visible) => {
        const element = document.querySelector(selector);
        if (element) element.closest('.col-md-3, .col-md-6, .card')?.classList.toggle('d-none', !visible);
    };
    toggleReportPanel('#reportTotalMembers', canViewMembers);
    toggleReportPanel('#reportActiveMembers', canViewMembers);
    toggleReportPanel('#reportTotalDonations', canViewFinance);
    toggleReportPanel('#reportEventsHeld', canViewEvents);
    toggleReportPanel('#membershipChart', canViewMembers);
    toggleReportPanel('#donationChart', canViewFinance);
    toggleReportPanel('#welfareReportRows', canViewWelfare);
    if (canViewWelfare) renderWelfareReportRows();
}
