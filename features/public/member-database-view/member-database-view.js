// Feature: public/member-database-view
// Source: index.html#memberDatabaseView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/member-database-view"] = {
    source: "index.html#memberDatabaseView",
    ids: [
        "memberDatabaseView",
        "memberSearchBox",
        "membersList",
        "studentBulkAction"
    ],
    handlers: [
        "applyStudentBulkAction",
        "toggleAllStudentSelection"
    ]
  };
}());
