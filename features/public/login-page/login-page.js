// Feature: public/login-page
// Source: index.html#loginPage
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/login-page"] = {
    source: "index.html#loginPage",
    ids: [
        "confirmPassword",
        "course",
        "email",
        "fullName",
        "loginForm",
        "loginPage",
        "loginPassword",
        "loginSubmitBtn",
        "loginTab",
        "loginTabBtn",
        "loginUsername",
        "passwordStrengthBar",
        "passwordStrengthText",
        "phone",
        "regPassword",
        "registerTab",
        "registerTabBtn",
        "registrationForm",
        "registrationRole",
        "school",
        "semester",
        "studentId",
        "toggleConfirmPassword",
        "togglePassword",
        "toggleRegPassword",
        "yearOfStudy"
    ],
    handlers: [
        "showForgotPassword",
        "showLanding"
    ]
  };
}());
