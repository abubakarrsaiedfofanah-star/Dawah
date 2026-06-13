// Feature: officer/officer-login-tab
// Source: officer.html#officerLoginTab
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["officer/officer-login-tab"] = {
    source: "officer.html#officerLoginTab",
    ids: [
        "officerLoginButton",
        "officerLoginForm",
        "officerLoginPassword",
        "officerLoginTab",
        "officerLoginUsername"
    ],
    handlers: [
        "showOfficerForgotPassword"
    ]
  };
}());
