// Feature: public/events-view
// Source: index.html#eventsView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/events-view"] = {
    source: "index.html#eventsView",
    ids: [
        "eventsList",
        "eventsView",
        "registeredEventsDetails",
        "registeredEventsList"
    ],
    handlers: [
        "showEventModal",
        "toggleSection"
    ]
  };
}());
