// Feature: public/membership-status-view
// Source: index.html#membershipStatusView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/membership-status-view"] = {
    source: "index.html#membershipStatusView",
    ids: [
        "membershipCardApplicationPanel",
        "membershipDetailExpiryDate",
        "membershipDetailJoinDate",
        "membershipDetailPaymentStatus",
        "membershipDetailStatus",
        "membershipStatusView"
    ],
    handlers: [
        "applyForMembershipCard",
        "openMemberDigitalCard",
        "showMembershipDuesPayment"
    ]
  };
}());
