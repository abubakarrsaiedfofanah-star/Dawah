// Feature: officer/officer-forgot-tab
// Source: officer.html#officerForgotTab
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["officer/officer-forgot-tab"] = {
    source: "officer.html#officerForgotTab",
    ids: [
        "officerForgotButton",
        "officerForgotEmail",
        "officerForgotPasswordForm",
        "officerForgotTab",
        "officerResetButton",
        "officerResetCode",
        "officerResetConfirmPassword",
        "officerResetPassword",
        "officerResetPasswordForm"
    ],
    handlers: [
        "resendOfficerResetCode"
    ]
  };
}());
