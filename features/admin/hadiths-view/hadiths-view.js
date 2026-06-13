// Feature: admin/hadiths-view
// Source: admin.html#hadithsView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/hadiths-view"] = {
    source: "admin.html#hadithsView",
    ids: [
        "adminArabicSuggestionStatus",
        "adminSuggestArabicBtn",
        "hadithArabic",
        "hadithCategory",
        "hadithEnglish",
        "hadithReference",
        "hadithSource",
        "hadithVerificationStatus",
        "hadithsList",
        "hadithsView"
    ],
    handlers: [
        "addHadith",
        "suggestAdminHadithArabic"
    ]
  };
}());
