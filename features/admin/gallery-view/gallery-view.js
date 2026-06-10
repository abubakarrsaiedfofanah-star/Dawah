// Feature: admin/gallery-view
// Source: admin.html#galleryView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/gallery-view"] = {
    source: "admin.html#galleryView",
    ids: [
        "galleryDescription",
        "galleryImagePreview",
        "galleryImageUpload",
        "galleryImageUrl",
        "galleryList",
        "galleryTitle",
        "galleryVideoPreview",
        "galleryView"
    ],
    handlers: [
        "addGalleryItem"
    ]
  };
}());
