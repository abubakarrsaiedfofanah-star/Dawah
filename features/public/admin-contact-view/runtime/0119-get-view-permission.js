// Runtime slice from daawah.js: getViewPermission.
function getViewPermission(viewName) {
    const viewPermissions = {
        profile: 'view_profile',
        membershipStatus: 'view_membership',
        prayer: 'view_prayer_times',
        events: 'register_events',
        activities: 'view_announcements',
        announcements: 'view_announcements',
        resources: 'view_resources',
        research: 'view_resources',
        settings: null,
        welfare: 'welfare_request',
        dues: 'view_payments',
        donations: 'view_donations',
        volunteer: 'register_volunteer',
        memberDatabase: 'manage_members',
        adminEvents: 'manage_events',
        adminWelfare: 'manage_welfare',
        leadership: 'manage_leadership',
        reports: 'view_reports',
        adminGallery: 'manage_gallery',
        adminContact: 'manage_contact',
        officerHadiths: 'manage_hadiths'
    };

    return viewPermissions[viewName] || null;
}
