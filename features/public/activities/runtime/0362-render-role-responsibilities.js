// Runtime slice from daawah.js: renderRoleResponsibilities.
function renderRoleResponsibilities(role) {
    const guide = {
        organizer: [
            ['fa-calendar-plus', 'Activities', 'Add daily, weekly, and monthly programmes students should attend.'],
            ['fa-people-group', 'Volunteer Work', 'Create service opportunities and follow up registered volunteers.']
        ],
        treasurer: [
            ['fa-money-check-dollar', 'Payments', 'Confirm dues only after checking proof or transaction reference.'],
            ['fa-hand-holding-dollar', 'Donations', 'Review donation records and keep finance reports accurate.']
        ],
        vice_treasurer: [
            ['fa-money-check-dollar', 'Payments', 'Assist the Treasurer with dues confirmation and receipt tracking.'],
            ['fa-file-invoice', 'Reports', 'Review payment and donation summaries before meetings.']
        ],
        media: [
            ['fa-photo-film', 'Gallery', 'Upload real photos, videos, and public media from events.'],
            ['fa-share-nodes', 'Contact Links', 'Keep WhatsApp, YouTube, and social links updated for public visitors.']
        ],
        secretary: [
            ['fa-user-graduate', 'Student Records', 'Keep student records organized and ready for reports.'],
            ['fa-bullhorn', 'Announcements', 'Post official updates that students will see in their dashboard.']
        ],
        vice_secretary: [
            ['fa-user-graduate', 'Student Records', 'Support the Secretary with student records and attendance notes.'],
            ['fa-bullhorn', 'Announcements', 'Prepare and publish approved announcements for students.']
        ],
        chairlady: [
            ['fa-hand-holding-heart', 'Welfare Requests', 'Review support requests and update their status clearly.'],
            ['fa-clipboard-check', 'Follow Up', 'Track pending welfare matters until they are approved, rejected, or completed.']
        ],
        vice_chairlady_1: [
            ['fa-hand-holding-heart', 'Welfare Requests', 'Assist with student support requests and case follow-up.'],
            ['fa-clipboard-check', 'Follow Up', 'Keep welfare actions clear for leadership review.']
        ],
        vice_chairlady_2: [
            ['fa-hand-holding-heart', 'Welfare Requests', 'Assist with student support requests and case follow-up.'],
            ['fa-clipboard-check', 'Follow Up', 'Keep welfare actions clear for leadership review.']
        ],
        amir_director: [
            ['fa-mosque', 'Prayer Times', 'Maintain prayer schedules, Jumuah reminders, and lecture information.'],
            ['fa-book-quran', 'Hadith & Resources', 'Add authentic reminders and learning resources for students.']
        ],
        executive: [
            ['fa-users-gear', 'Operations', 'Coordinate members, events, reports, and officer activity.'],
            ['fa-chart-pie', 'Oversight', 'Review system reports before public decisions are made.']
        ],
        admin: [
            ['fa-user-shield', 'System Control', 'Approve roles, manage records, and keep public content accurate.'],
            ['fa-chart-line', 'Reports', 'Use real reports for leadership decisions.']
        ],
        student: [
            ['fa-id-card', 'Profile', 'Keep your student record complete and current.'],
            ['fa-calendar-check', 'Participation', 'Register for events, welfare, volunteer work, payments, and donations.']
        ]
    };
    const items = guide[role] || guide.student;
    return items.map(([icon, title, text]) => `
        <div class="role-responsibility-item">
            <i class="fas ${icon}"></i>
            <span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></span>
        </div>
    `).join('');
}
