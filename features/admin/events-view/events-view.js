// Feature: admin/events-view
// Source: admin.html#eventsView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/events-view"] = {
    source: "admin.html#eventsView",
    ids: [
        "eventCapacity",
        "eventCategory",
        "eventDate",
        "eventDescription",
        "eventLocation",
        "eventRegistrationsList",
        "eventTitle",
        "eventsList",
        "eventsView"
    ],
    handlers: [
        "createEvent"
    ]
  };
}());
