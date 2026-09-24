// Runtime slice from admin.js: defaultPermissionsForRole.
function defaultPermissionsForRole(role) {
    const member = ['view_profile', 'view_membership', 'register_events', 'view_prayer_times', 'view_announcements', 'view_resources', 'welfare_request', 'view_payments', 'view_donations', 'register_volunteer'];
    const map = {
        chairlady: [...member, 'manage_welfare', 'view_reports'],
        vice_chairlady_1: [...member, 'manage_welfare', 'view_reports'],
        vice_chairlady_2: [...member, 'manage_welfare', 'view_reports'],
        secretary: [...member, 'manage_members', 'view_reports', 'generate_reports', 'create_announcements'],
        vice_secretary: [...member, 'manage_members', 'view_reports', 'generate_reports', 'create_announcements'],
        treasurer: [...member, 'manage_payments', 'view_reports', 'generate_reports'],
        vice_treasurer: [...member, 'manage_payments', 'view_reports', 'generate_reports'],
        media: [...member, 'manage_gallery', 'manage_contact'],
        organizer: [...member, 'manage_events', 'manage_activities'],
        amir_director: ['view_profile', 'view_prayer_times', 'view_announcements', 'view_resources', 'manage_prayer_times', 'manage_lectures', 'manage_hadiths'],
        executive: [...member, 'manage_members', 'manage_events', 'manage_activities', 'manage_welfare', 'manage_gallery', 'manage_contact', 'manage_payments', 'manage_prayer_times', 'manage_lectures', 'manage_hadiths', 'view_reports', 'generate_reports', 'create_announcements', 'manage_leadership'],
        admin: [...member, 'manage_members', 'manage_events', 'manage_activities', 'manage_welfare', 'manage_gallery', 'manage_contact', 'manage_payments', 'manage_prayer_times', 'manage_lectures', 'manage_hadiths', 'view_reports', 'generate_reports', 'create_announcements', 'manage_leadership']
    };
    return map[String(role || '').trim().toLowerCase().replace(/[\s-]+/g, '_')] || [];
}
