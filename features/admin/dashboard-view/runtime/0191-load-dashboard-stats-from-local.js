// Runtime slice from admin.js: loadDashboardStatsFromLocal.
function loadDashboardStatsFromLocal() {
    fetch(`${API_URL}?action=getDashboardStats`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const stats = result.data || {};
        setText('memberCount', stats.members || 0);
        setText('studentCount', stats.students || 0);
        setText('donationTotal', formatMoney(stats.donation_total || 0));
        setText('donationCount', stats.donations || 0);
        setText('pendingDonationCount', stats.pending_donations || 0);
        setText('failedDonationCount', stats.failed_donations || 0);
        setText('pendingDonationAmount', formatMoney(stats.pending_donation_amount || 0));
        setText('monthDonationTotal', formatMoney(stats.month_donation_total || 0));
        setText('paymentTotal', formatMoney(stats.payment_total || 0));
        setText('paymentCount', stats.payments || 0);
        setText('pendingPaymentCount', stats.pending_payments || 0);
        setText('failedPaymentCount', stats.failed_payments || 0);
        setText('pendingPaymentAmount', formatMoney(stats.pending_payment_amount || 0));
        setText('monthPaymentTotal', formatMoney(stats.month_payment_total || 0));
        setText('welfareCount', stats.welfare_requests || 0);
        setText('pendingWelfareCount', stats.pending_welfare || 0);
        setText('eventCount', stats.events || 0);
        setText('announcementCount', stats.announcements || 0);
        setText('resourceCount', stats.resources || 0);
        setText('galleryCount', stats.gallery || 0);
        setText('leaderCount', stats.leaders || 0);
        setText('hadithCount', stats.hadiths || 0);
        setText('prayerCount', stats.prayer_days || 0);
        setText('researchCount', stats.research || 0);
        setText('researchTodayCount', stats.research_today || 0);
        setText('researchDeepCount', stats.research_deep || 0);
        setText('researchIslamicCount', stats.research_islamic || 0);
        setText('notificationCount', stats.notifications || 0);
        renderAdminDashboardCharts(stats);
        renderNeedsAttentionPanel();
    })
    .catch(error => {
        console.error('Error loading dashboard stats:', error);
        showNotification('Error loading database dashboard stats', 'warning');
        renderNeedsAttentionPanel();
    });
}
