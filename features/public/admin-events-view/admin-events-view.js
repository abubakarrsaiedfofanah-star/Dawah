// Feature: public/admin-events-view
// Source: index.html#adminEventsView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/admin-events-view"] = {
    source: "index.html#adminEventsView",
    ids: [
        "adminEventsList",
        "adminEventsView"
    ],
    handlers: [
        "showCreateEventModal"
    ]
  };
}());
