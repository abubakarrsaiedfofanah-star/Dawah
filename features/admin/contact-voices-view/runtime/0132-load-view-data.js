// Runtime slice from admin.js: loadViewData.
function loadViewData(viewName) {
    switch(viewName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'events':
            loadEvents();
            break;
        case 'leadership':
            loadLeadership();
            break;
        case 'gallery':
            loadGallery();
            break;
        case 'contactVoices':
            loadAdminSiteSettings();
            loadAdminContactVoiceMessages();
            break;
        case 'hadiths':
            loadHadiths();
            break;
        case 'welfare':
            loadWelfareRequests();
            break;
        case 'prayer':
            loadPrayerAdmin();
            break;
        case 'resources':
            loadResourcesAdmin();
            break;
        case 'account':
            loadAccountAdminTools();
            renderRolePermissionEditor();
            break;
        case 'settings':
            loadAdminWorkspaceSettings();
            break;
    }
}

// Load all data for dashboard
