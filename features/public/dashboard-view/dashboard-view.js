// Feature: public/dashboard-view
// Source: index.html#dashboardView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/dashboard-view"] = {
    source: "index.html#dashboardView",
    ids: [
        "announcementCount",
        "announcementsList",
        "dashboardActivityCalendar",
        "dashboardAlertCount",
        "dashboardAlertsList",
        "dashboardReportButtons",
        "dashboardRoleBadge",
        "dashboardRoleSummary",
        "dashboardStats",
        "dashboardView",
        "duesStatusValue",
        "hadithCounter",
        "hadithReference",
        "hadithText",
        "hadithTotal",
        "hadithTranslation",
        "membershipStatusValue",
        "prayerTimesList",
        "profileCompletionText",
        "profileCompletionValue",
        "roleQuickActions",
        "roleResponsibilities",
        "upcomingEventsCount",
        "userNameDisplay"
    ],
    handlers: [
        "enableBrowserNotifications",
        "nextHadith",
        "previousHadith",
        "printSystemReport",
        "switchView",
        "toggleSection"
    ]
  };
}());
