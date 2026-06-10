// Feature: public/settings-view
// Source: index.html#settingsView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/settings-view"] = {
    source: "index.html#settingsView",
    ids: [
        "settingAiChatEnabled",
        "settingBrowserNotifications",
        "settingCompactDashboard",
        "settingReducedMotion",
        "settingResearchHistory",
        "settingResearchMode",
        "settingsView"
    ],
    handlers: [
        "resetWorkspaceSettings",
        "saveWorkspaceSettings"
    ]
  };
}());
