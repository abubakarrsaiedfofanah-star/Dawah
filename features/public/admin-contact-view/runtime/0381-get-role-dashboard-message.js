// Runtime slice from daawah.js: getRoleDashboardMessage.
function getRoleDashboardMessage() {
    const role = currentRole || currentUser?.role || 'student';
    const messages = {
        chairlady: 'Chairlady workspace for welfare requests, member support, and oversight reports.',
        vice_chairlady_1: 'Vice Chairlady 1 workspace with the same welfare and oversight tools as Chairlady.',
        vice_chairlady_2: 'Vice Chairlady 2 workspace with the same welfare and oversight tools as Chairlady.',
        secretary: 'Secretary workspace for member records, announcements, and general reports.',
        vice_secretary: 'Vice Secretary workspace with the same member, announcement, and report tools as Secretary.',
        executive: 'Executive workspace for member management, programmes, welfare, reports, and communication.',
        admin: 'Admin workspace for full system management, reports, content, and member records.',
        treasurer: 'Treasurer workspace for dues, donations, payment confirmation, and financial reports.',
        vice_treasurer: 'Vice Treasurer workspace with the same dues, donations, payment confirmation, and report tools as Treasurer.',
        media: 'Media workspace for gallery, videos, contact messages, and publicity.',
        organizer: 'Organizer workspace for events, activities, volunteers, and programme coordination.',
        amir_director: 'Amir Da\'awah / Director of Da\'awah workspace for prayer times, hadiths, Islamic resources, lectures, and reminders.',
        student: 'Member workspace for profile, events, welfare, dues, donations, and resources.'
    };
    return messages[role] || messages.student;
}
