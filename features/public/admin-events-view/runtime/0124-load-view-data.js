// Runtime slice from daawah.js: loadViewData.
function loadViewData(viewName) {
    switch(viewName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'membershipStatus':
            loadMembershipStatus();
            break;
        case 'prayer':
            loadPrayerTimes();
            break;
        case 'events':
            loadEventsData();
            break;
        case 'activities':
            loadActivitiesData();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'resources':
            loadResources();
            break;
        case 'research':
            loadResearchAssistant();
            break;
        case 'settings':
            loadWorkspaceSettings();
            break;
        case 'welfare':
            loadWelfareData();
            break;
        case 'dues':
            loadDuesData();
            break;
        case 'donations':
            loadDonationsData();
            break;
        case 'volunteer':
            loadVolunteerData();
            break;
        case 'memberDatabase':
            loadMemberDatabase();
            break;
        case 'adminEvents':
            loadAdminEvents();
            break;
        case 'adminWelfare':
            loadAdminWelfare();
            break;
        case 'leadership':
            loadLeadership();
            break;
        case 'reports':
            loadReportsData();
            setTimeout(() => initializeCharts(), 300);
            break;
        case 'adminGallery':
            loadAdminGallery();
            break;
        case 'adminContact':
            loadAdminContact();
            break;
        case 'officerHadiths':
            loadOfficerHadiths();
            break;
    }
}

// ACTIVITIES
