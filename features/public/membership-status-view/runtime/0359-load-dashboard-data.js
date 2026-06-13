// Runtime slice from daawah.js: loadDashboardData.
function loadDashboardData() {
    if (!currentUser) return;

    // Update date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    const dashboardDateEl = document.getElementById('dashboardDate');
    if (dashboardDateEl) dashboardDateEl.textContent = dateStr;
    const roleMessage = document.querySelector('#dashboardView .welcome-subtext');
    if (roleMessage) {
        roleMessage.textContent = getRoleDashboardMessage();
    }

    // Profile Summary
    setTextById('dashName', currentUser.name || currentUser.fullName || currentUser.username);
    setTextById('dashStudentId', currentUser.studentId || currentUser.id || 'Not set');
    setTextById('dashCourse', currentUser.course || 'Not set');
    setTextById('dashYear', currentUser.year || currentUser.yearOfStudy || 'Not set');

    // Membership Status
    setTextById('membershipStatusValue', getMembershipDisplayState().status);

    // Upcoming Events Count
    const upcomingCount = getAvailableEvents().length;
    setTextById('upcomingEventsCount', upcomingCount);

    // Dues Status
    const duesPaid = getCompletedMembershipDuesPayment() ? 'Paid' : 'No payment';
    setTextById('duesStatusValue', duesPaid);

    // Welfare Status
    const welfareCount = welfareRequests.filter(w => w.status === 'Pending' || w.status === 'Pending Review').length;
    setTextById('welfareStatusValue', welfareCount || '0');
    loadDashboardPrayerTimes();
    renderRoleWorkspace();
    renderProfileCompletion();
    renderDashboardAlerts();
    loadStudentNotifications();
    renderDashboardActivityCalendar();
    configureDashboardReports();
    loadActivitiesFromApi().then(renderDashboardActivityCalendar);

    // Load Announcements
    const announcementsList = document.getElementById('announcementsList');
    if (announcementsList) {
        const announcements = readList('adminAnnouncements').map(ann => ({
            title: ann.title,
            text: ann.content,
            time: ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recently'
        }));

        if (announcements.length === 0) {
            announcementsList.innerHTML = renderEmptyState('fa-bullhorn', 'No announcements yet', 'Secretary announcements will appear here.');
        } else {
            announcementsList.innerHTML = announcements.map(ann => `
                <div class="announcement-item">
                    <small class="text-muted"><i class="fas fa-clock"></i> ${ann.time}</small>
                    <p class="mb-1"><strong>${ann.title}</strong></p>
                    <p class="text-muted small">${ann.text}</p>
                </div>
            `).join('<hr>');
        }
    }

    // Load Meetings
    const meetingsList = document.getElementById('meetingsList');
    if (meetingsList) {
        meetingsList.innerHTML = renderEmptyState('fa-clipboard-list', 'No meetings yet', 'Meeting records can be added later.');
    }
}
