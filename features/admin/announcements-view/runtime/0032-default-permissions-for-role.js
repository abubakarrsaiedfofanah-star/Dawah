// Runtime slice from admin.js: defaultPermissionsForRole.
function defaultPermissionsForRole(role) {
    const map = {
        chairlady: ['view_profile', 'view_membership', 'view_announcements', 'view_resources', 'manage_welfare', 'view_reports'],
        vice_chairlady_1: ['view_profile', 'view_membership', 'view_announcements', 'view_resources', 'manage_welfare', 'view_reports'],
        vice_chairlady_2: ['view_profile', 'view_membership', 'view_announcements', 'view_resources', 'manage_welfare', 'view_reports'],
        secretary: ['view_profile', 'view_membership', 'view_announcements', 'view_resources', 'manage_members', 'view_reports', 'generate_reports', 'create_announcements'],
        vice_secretary: ['view_profile', 'view_membership', 'view_announcements', 'view_resources', 'manage_members', 'view_reports', 'generate_reports', 'create_announcements'],
        treasurer: ['view_profile', 'view_membership', 'view_payments', 'view_donations', 'manage_payments', 'view_reports', 'generate_reports'],
        vice_treasurer: ['view_profile', 'view_membership', 'view_payments', 'view_donations', 'manage_payments', 'view_reports', 'generate_reports'],
        media: ['view_profile', 'view_announcements', 'view_resources', 'manage_gallery', 'manage_contact'],
        organizer: ['view_profile', 'register_events', 'register_volunteer', 'manage_events', 'manage_activities'],
        amir_director: ['view_profile', 'view_prayer_times', 'view_announcements', 'view_resources', 'manage_prayer_times', 'manage_lectures', 'manage_hadiths'],
        executive: EDITABLE_ROLE_PERMISSIONS
    };
    return map[role] || [];
}
