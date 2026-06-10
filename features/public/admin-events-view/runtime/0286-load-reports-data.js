// Runtime slice from daawah.js: loadReportsData.
function loadReportsData() {
    const activeMembers = allMembers.filter(member => String(member.status || '').toLowerCase() === 'active').length;
    const completedDonations = donations
        .filter(donation => String(donation.status || '').toLowerCase() === 'completed')
        .reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
    const completedEvents = allEvents.filter(event => ['completed', 'held'].includes(String(event.status || '').toLowerCase())).length;

    const reportValues = {
        reportTotalMembers: allMembers.length,
        reportActiveMembers: activeMembers,
        reportTotalDonations: completedDonations ? formatCurrency(completedDonations) : '0',
        reportEventsHeld: completedEvents
    };

    Object.entries(reportValues).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = String(value);
    });
    renderWelfareReportRows();
}
