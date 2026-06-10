// Feature: admin/leadership-view
// Source: admin.html#leadershipView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/leadership-view"] = {
    source: "admin.html#leadershipView",
    ids: [
        "leaderBio",
        "leaderCourse",
        "leaderDescription",
        "leaderEmail",
        "leaderName",
        "leaderPassportPhoto",
        "leaderPhone",
        "leaderPosition",
        "leaderYearOfStudy",
        "leadershipList",
        "leadershipView"
    ],
    handlers: [
        "addLeader"
    ]
  };
}());
