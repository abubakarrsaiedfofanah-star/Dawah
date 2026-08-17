// Runtime slice from admin.js: getOfficerApprovalSummary.
function getOfficerApprovalSummary(role) {
    const summaries = {
        chairlady: 'Approving gives access to welfare management and oversight reports.',
        vice_chairlady_1: 'Approving gives access to the same welfare management and oversight reports as Chairlady.',
        vice_chairlady_2: 'Approving gives access to the same welfare management and oversight reports as Chairlady.',
        secretary: 'Approving gives access to member records, announcements, and reports.',
        vice_secretary: 'Approving gives access to the same member records, announcements, and reports as Secretary.',
        treasurer: 'Approving gives access to dues, donations, payment confirmation, and reports.',
        vice_treasurer: 'Approving gives access to the same dues, donations, payment confirmation, and reports as Treasurer.',
        media: 'Approving gives access to gallery, videos, contact messages, and publicity tools.',
        organizer: 'Approving gives access to events, daily/weekly/monthly activities, and volunteer tools.',
        amir_director: 'Approving gives access to prayer times, hadiths, Islamic resources, lectures, and reminders.'
    };
    return summaries[String(role || '').toLowerCase()] || 'Approving gives access only to the tools assigned to this role.';
}
