// Feature: admin/resources-view
// Source: admin.html#resourcesView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/resources-view"] = {
    source: "admin.html#resourcesView",
    ids: [
        "resourceCategory",
        "resourceDescription",
        "resourceFile",
        "resourceTitle",
        "resourceType",
        "resourceUrl",
        "resourcesList",
        "resourcesView"
    ],
    handlers: [
        "addResource"
    ]
  };
}());
