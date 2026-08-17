// Runtime slice from daawah.js: hasPermission.
function hasPermission(permission) {
    const memberPermissions = [
        'view_profile',
        'view_membership',
        'register_events',
        'view_prayer_times',
        'view_announcements',
        'view_resources',
        'welfare_request',
        'view_payments',
        'view_donations',
        'register_volunteer'
    ];

    const adminPermissions = [
        ...memberPermissions,
        'manage_members',
        'manage_events',
        'manage_activities',
        'manage_welfare',
        'manage_gallery',
        'manage_contact',
        'manage_payments',
        'manage_prayer_times',
        'manage_lectures',
        'manage_hadiths',
        'view_reports',
        'generate_reports',
        'create_announcements',
        'manage_leadership'
    ];

    const rolePermissions = {
        'student': memberPermissions,
        'executive': adminPermissions,
        'chairlady': [
            ...memberPermissions,
            'manage_welfare',
            'view_reports'
        ],
        'vice_chairlady_1': [
            ...memberPermissions,
            'manage_welfare',
            'view_reports'
        ],
        'vice_chairlady_2': [
            ...memberPermissions,
            'manage_welfare',
            'view_reports'
        ],
        'secretary': [
            ...memberPermissions,
            'manage_members',
            'view_reports',
            'generate_reports',
            'create_announcements'
        ],
        'vice_secretary': [
            ...memberPermissions,
            'manage_members',
            'view_reports',
            'generate_reports',
            'create_announcements'
        ],
        'admin': adminPermissions,
        'treasurer': [
            ...memberPermissions,
            'manage_payments',
            'view_reports',
            'generate_reports'
        ],
        'vice_treasurer': [
            ...memberPermissions,
            'manage_payments',
            'view_reports',
            'generate_reports'
        ],
        'media': [
            ...memberPermissions,
            'manage_gallery',
            'manage_contact'
        ],
        'organizer': [
            ...memberPermissions,
            'manage_events',
            'manage_activities',
            'register_volunteer'
        ],
        'amir_director': [
            'view_profile',
            'view_prayer_times',
            'view_announcements',
            'view_resources',
            'manage_prayer_times',
            'manage_lectures',
            'manage_hadiths'
        ]
    };

    const overrides = readStoredObject('rolePermissionOverrides', []);
    const override = Array.isArray(overrides) ? overrides.find(item => item.role === currentRole) : null;
    if (override && Array.isArray(override.permissions)) {
        return override.permissions.includes(permission);
    }
    return rolePermissions[currentRole]?.includes(permission) || false;
}

// Export & Download
