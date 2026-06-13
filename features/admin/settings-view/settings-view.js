// Feature: admin/settings-view
// Source: admin.html#settingsView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/settings-view"] = {
    source: "admin.html#settingsView",
    ids: [
        "adminSettingAiChatEnabled",
        "adminSettingBrowserNotifications",
        "adminSettingCompactDashboard",
        "adminSettingReducedMotion",
        "adminSettingResearchHistory",
        "adminSettingResearchMode",
        "settingsView"
    ],
    handlers: [
        "loadAdminWorkspaceSettings",
        "resetAdminWorkspaceSettings",
        "saveAdminWorkspaceSettings"
    ]
  };
}());
