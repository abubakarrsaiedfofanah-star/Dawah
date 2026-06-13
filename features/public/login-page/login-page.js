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
        "dashboardInstallActions",
        "dashboardPanelFooter",
        "email",
        "emergencyContact",
        "fullName",
        "gender",
        "homeAddress",
        "localGuardian",
        "loginForm",
        "loginPage",
        "loginPassword",
        "loginSubmitBtn",
        "loginTab",
        "loginTabBtn",
        "loginUsername",
        "nationality",
        "passportPhoto",
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
        "return showPublicSection(",
        "showForgotPassword",
        "showLanding"
    ]
  };
}());
