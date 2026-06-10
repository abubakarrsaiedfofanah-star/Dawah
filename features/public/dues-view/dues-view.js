// Feature: public/dues-view
// Source: index.html#duesView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/dues-view"] = {
    source: "index.html#duesView",
    ids: [
        "duesView",
        "mpesaReadinessPanel",
        "paymentFinanceSummary",
        "paymentHistoryList",
        "paymentReviewControls",
        "paymentSearchInput",
        "paymentStatusFilter",
        "paymentStatusSummary",
        "paymentSummaryDetails"
    ],
    handlers: [
        "exportFinanceCsv",
        "showPaymentModal"
    ]
  };
}());
