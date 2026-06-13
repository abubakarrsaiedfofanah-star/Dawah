// Feature: admin/account-view
// Source: admin.html#accountView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/account-view"] = {
    source: "admin.html#accountView",
    ids: [
        "accountView",
        "adminAccountLimitBadge",
        "adminAccountsList",
        "adminActivityLogList",
        "adminChangePasswordButton",
        "adminChangePasswordForm",
        "adminConfirmNewPassword",
        "adminCreateForm",
        "adminCurrentPassword",
        "adminNewPassword",
        "adminPhotoInput",
        "adminPhotoPreview",
        "adminPhotoPreviewIcon",
        "adminSelfResetButton",
        "databaseRestoreInput",
        "mainAdminAccountTools",
        "managedAdminCreateButton",
        "managedAdminEmail",
        "managedAdminPassword",
        "managedAdminUsername",
        "memberPasswordResetButton",
        "memberPasswordResetForm",
        "memberPasswordUser",
        "memberRoleAssignButton",
        "memberRoleAssignForm",
        "memberRoleStatus",
        "memberRoleUser",
        "memberRoleValue",
        "myAdminActivityLogList",
        "pendingRoleRequestsList",
        "permissionRoleSelect",
        "rolePermissionEditorList"
    ],
    handlers: [
        "clearAllAdminActivityLogs",
        "clearMyAdminActivityLogs",
        "downloadDatabaseBackup",
        "removeAdminPhoto",
        "resetMyAdminPassword",
        "resetRolePermissionEditor",
        "saveAdminPhoto",
        "saveRolePermissionEditor",
        "togglePasswordVisibility"
    ]
  };
}());
