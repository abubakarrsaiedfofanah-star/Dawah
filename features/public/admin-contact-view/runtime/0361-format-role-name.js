// Runtime slice from daawah.js: formatRoleName.
function formatRoleName(role) {
    const labels = {
        executive: 'Sub Admin / Executive',
        chairlady: 'Chairlady',
        vice_chairlady_1: 'Vice Chairlady 1',
        vice_chairlady_2: 'Vice Chairlady 2',
        secretary: 'Secretary',
        vice_secretary: 'Vice Secretary',
        organizer: 'Organizer',
        media: 'Media',
        treasurer: 'Treasurer',
        vice_treasurer: 'Vice Treasurer',
        amir_director: 'Amir Da\'awah / Director of Da\'awah',
        admin: 'Main Admin',
        student: 'Student'
    };
    return labels[role] || 'Member';
}
