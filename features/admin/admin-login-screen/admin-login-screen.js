// Feature: admin/admin-login-screen
// Source: admin.html#adminLoginScreen
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/admin-login-screen"] = {
    source: "admin.html#adminLoginScreen",
    ids: [
        "adminForgotButton",
        "adminForgotEmail",
        "adminForgotPasswordForm",
        "adminForgotTab",
        "adminForgotTabBtn",
        "adminLoginButton",
        "adminLoginError",
        "adminLoginForm",
        "adminLoginPassword",
        "adminLoginScreen",
        "adminLoginTab",
        "adminLoginTabBtn",
        "adminLoginUsername",
        "adminRegisterButton",
        "adminRegisterConfirmPassword",
        "adminRegisterEmail",
        "adminRegisterForm",
        "adminRegisterPassword",
        "adminRegisterTab",
        "adminRegisterTabBtn",
        "adminRegisterTabItem",
        "adminRegisterUsername",
        "adminResetCode",
        "adminResetNewPassword",
        "adminResetWithCodeButton",
        "adminResetWithCodeForm"
    ],
    handlers: [
        "togglePasswordVisibility"
    ]
  };
}());
