// Feature: admin/announcements-view
// Source: admin.html#announcementsView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/announcements-view"] = {
    source: "admin.html#announcementsView",
    ids: [
        "announcementContent",
        "announcementExpires",
        "announcementPriority",
        "announcementTitle",
        "announcementsList",
        "announcementsView"
    ],
    handlers: [
        "createAnnouncement"
    ]
  };
}());
