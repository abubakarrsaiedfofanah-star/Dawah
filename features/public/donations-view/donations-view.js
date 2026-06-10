// Feature: public/donations-view
// Source: index.html#donationsView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/donations-view"] = {
    source: "index.html#donationsView",
    ids: [
        "donationCards",
        "donationFinanceSummary",
        "donationHistoryList",
        "donationReviewControls",
        "donationSearchInput",
        "donationStatusFilter",
        "donationsView"
    ],
    handlers: [
        "exportFinanceCsv",
        "showDonationModal",
        "toggleSection"
    ]
  };
}());
