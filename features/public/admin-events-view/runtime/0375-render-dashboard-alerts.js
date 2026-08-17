// Runtime slice from daawah.js: renderDashboardAlerts.
function renderDashboardAlerts() {
    const alerts = [];
    const role = currentRole || currentUser?.role || 'student';
    const pendingPayments = payments.filter(item => item.status !== 'Completed').length;
    const pendingWelfare = welfareRequests.filter(item => ['Pending', 'Pending Review', 'pending'].includes(item.status)).length;
    const volunteerSignups = databaseVolunteerRecords.filter(item => item.status === 'registered').length;
    if ((currentUser?.status || 'Active').toLowerCase() === 'pending') alerts.push(['fa-user-clock', 'Your role request is waiting for main admin approval.']);
    if (hasPermission('manage_payments') && pendingPayments) alerts.push(['fa-money-check', `${pendingPayments} payment/donation item(s) need confirmation.`]);
    if (hasPermission('manage_welfare') && pendingWelfare) alerts.push(['fa-hand-holding-heart', `${pendingWelfare} welfare request(s) need review.`]);
    if (hasPermission('manage_events') && volunteerSignups) alerts.push(['fa-hands-helping', `${volunteerSignups} volunteer signup(s) need follow-up.`]);
    const cardExpiry = currentUser?.membershipCardExpiresAt ? new Date(currentUser.membershipCardExpiresAt) : null;
    if (cardExpiry && !Number.isNaN(cardExpiry.getTime())) {
        const daysLeft = Math.ceil((cardExpiry.getTime() - Date.now()) / 86400000);
        if (daysLeft <= 0) {
            alerts.push(['fa-id-card', 'Your membership card has expired. Please renew your dues/card.']);
        } else if ([60, 30, 7].some(days => daysLeft <= days)) {
            alerts.push(['fa-id-card', `Your membership card expires in ${daysLeft} day(s).`]);
        }
    }
    if (hasPermission('manage_members')) {
        const expiring = allMembers.filter(member => {
            const expiry = member.membershipCardExpiresAt ? new Date(member.membershipCardExpiresAt) : null;
            if (!expiry || Number.isNaN(expiry.getTime())) return false;
            const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
            return daysLeft <= 60;
        }).length;
        if (expiring) alerts.push(['fa-id-card', `${expiring} membership card(s) expire within 60 days or already expired.`]);
    }
    if (role === 'organizer') alerts.push(['fa-calendar-days', `${getActivities().length} activities are available to review.`]);
    if (!alerts.length) alerts.push(['fa-circle-check', 'No urgent items right now.']);

    const count = document.getElementById('dashboardAlertCount');
    const list = document.getElementById('dashboardAlertsList');
    if (count) count.textContent = String(Math.max(0, alerts.length - (alerts[0][0] === 'fa-circle-check' ? 1 : 0)));
    if (list) {
        list.innerHTML = `<div class="dashboard-alert-list">${alerts.map(([icon, message]) => `
            <div class="dashboard-alert-item"><i class="fas ${icon}"></i><span>${escapeHtml(message)}</span></div>
        `).join('')}</div>`;
    }
}
