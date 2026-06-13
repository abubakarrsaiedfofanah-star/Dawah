// Feature: public/leadership-view
// Source: index.html#leadershipView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/leadership-view"] = {
    source: "index.html#leadershipView",
    ids: [
        "leadershipRolesList",
        "leadershipView"
    ],
    handlers: [
        "showLeadershipModal",
        "showPublicLeadershipModal"
    ]
  };
}());
