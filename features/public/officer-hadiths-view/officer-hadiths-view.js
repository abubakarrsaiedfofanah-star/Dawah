// Feature: public/officer-hadiths-view
// Source: index.html#officerHadithsView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/officer-hadiths-view"] = {
    source: "index.html#officerHadithsView",
    ids: [
        "officerArabicSuggestionStatus",
        "officerHadithArabic",
        "officerHadithCategory",
        "officerHadithEnglish",
        "officerHadithForm",
        "officerHadithReference",
        "officerHadithSource",
        "officerHadithVerificationStatus",
        "officerHadithsList",
        "officerHadithsView",
        "officerSuggestArabicBtn"
    ],
    handlers: [
        "suggestOfficerHadithArabic"
    ]
  };
}());
