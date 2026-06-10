// Feature: public/admin-gallery-view
// Source: index.html#adminGalleryView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/admin-gallery-view"] = {
    source: "index.html#adminGalleryView",
    ids: [
        "adminGalleryView",
        "galleryItemsList"
    ],
    handlers: [
        "showAddGalleryModal"
    ]
  };
}());
