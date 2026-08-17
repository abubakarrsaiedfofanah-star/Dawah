// Runtime slice from daawah.js: renderRoleWorkspace.
function renderRoleWorkspace() {
    const role = currentRole || currentUser?.role || 'student';
    const roleBadge = document.getElementById('dashboardRoleBadge');
    const summary = document.getElementById('dashboardRoleSummary');
    const actions = document.getElementById('roleQuickActions');
    const responsibilities = document.getElementById('roleResponsibilities');
    if (!actions) return;

    const actionMap = {
        organizer: [['Activities', 'activities', 'fa-calendar-days', 'Plan daily, weekly, monthly'], ['Events', 'events', 'fa-calendar', 'Coordinate programmes'], ['Volunteer', 'volunteer', 'fa-hands-helping', 'Manage service teams']],
        treasurer: [['Dues', 'dues', 'fa-money-bill', 'Track member dues'], ['Donations', 'donations', 'fa-hand-holding-dollar', 'Confirm contributions'], ['Reports', 'reports', 'fa-chart-line', 'Review finance trends']],
        vice_treasurer: [['Dues', 'dues', 'fa-money-bill', 'Track member dues'], ['Donations', 'donations', 'fa-hand-holding-dollar', 'Confirm contributions'], ['Reports', 'reports', 'fa-chart-line', 'Review finance trends']],
        media: [['Gallery & Videos', 'adminGallery', 'fa-photo-film', 'Publish media'], ['Contact & Social', 'adminContact', 'fa-share-nodes', 'Update public links']],
        secretary: [['Students', 'memberDatabase', 'fa-user-graduate', 'Student records'], ['Announcements', 'announcements', 'fa-bullhorn', 'Post updates'], ['Reports', 'reports', 'fa-chart-pie', 'Meeting summaries']],
        vice_secretary: [['Students', 'memberDatabase', 'fa-user-graduate', 'Student records'], ['Announcements', 'announcements', 'fa-bullhorn', 'Post updates'], ['Reports', 'reports', 'fa-chart-pie', 'Meeting summaries']],
        amir_director: [['Prayer Times', 'prayer', 'fa-mosque', 'Prayer schedule'], ['Hadiths', 'officerHadiths', 'fa-book-open', 'Daily reminders'], ['Resources', 'resources', 'fa-book-open-reader', 'Learning materials']],
        chairlady: [['Welfare', 'adminWelfare', 'fa-hand-holding-heart', 'Support requests'], ['Reports', 'reports', 'fa-chart-line', 'Leadership overview']],
        vice_chairlady_1: [['Welfare', 'adminWelfare', 'fa-hand-holding-heart', 'Support requests'], ['Reports', 'reports', 'fa-chart-line', 'Leadership overview']],
        vice_chairlady_2: [['Welfare', 'adminWelfare', 'fa-hand-holding-heart', 'Support requests'], ['Reports', 'reports', 'fa-chart-line', 'Leadership overview']],
        executive: [['Students', 'memberDatabase', 'fa-user-graduate', 'Manage students'], ['Events', 'adminEvents', 'fa-calendar-check', 'Approve programmes'], ['Reports', 'reports', 'fa-chart-pie', 'System overview']],
        admin: [['Students', 'memberDatabase', 'fa-user-graduate', 'Manage students'], ['Leadership', 'leadership', 'fa-user-tie', 'Public officers'], ['Reports', 'reports', 'fa-chart-pie', 'System overview']],
        student: [['Profile', 'profile', 'fa-id-card', 'Your record'], ['Events', 'events', 'fa-calendar', 'Join programmes'], ['Volunteer', 'volunteer', 'fa-hands-helping', 'Serve the Jamaat'], ['Dues', 'dues', 'fa-money-bill', 'Payment status']]
    };
    const items = actionMap[role] || actionMap.student;
    if (roleBadge) roleBadge.textContent = formatRoleName(role);
    if (summary) summary.textContent = getRoleDashboardMessage();
    actions.innerHTML = items.map(([label, view, icon, helper]) => `
        <button type="button" class="btn btn-outline-primary btn-sm role-action-card" onclick="switchView('${view}')">
            <i class="fas ${icon}"></i>
            <span>
                <strong>${escapeHtml(label)}</strong>
                <small>${escapeHtml(helper || '')}</small>
            </span>
        </button>
    `).join('');
    if (responsibilities) {
        responsibilities.innerHTML = renderRoleResponsibilities(role);
    }
}
