// Runtime slice from admin.js: formatAdminRoleName.
function formatAdminRoleName(role) {
    const labels = {
        executive: 'Sub Admin / Executive',
        chairlady: 'Chairlady / Welfare Lead',
        vice_chairlady_1: 'Vice Chairlady 1 / Welfare Lead',
        vice_chairlady_2: 'Vice Chairlady 2 / Welfare Lead',
        secretary: 'Secretary',
        vice_secretary: 'Vice Secretary',
        treasurer: 'Treasurer',
        vice_treasurer: 'Vice Treasurer',
        media: 'Media',
        organizer: 'Organizer',
        amir_director: 'Amir Da\'awah / Director of Da\'awah',
        student: 'Student Member'
    };
    return labels[String(role || 'student').toLowerCase()] || role;
}
