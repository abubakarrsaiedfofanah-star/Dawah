// Feature: public/welfare-view
// Source: index.html#welfareView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/welfare-view"] = {
    source: "index.html#welfareView",
    ids: [
        "welfareRequestsTableBody",
        "welfareView"
    ],
    handlers: [
        "showWelfareModal"
    ]
  };
}());
