// Feature: public/profile-view
// Source: index.html#profileView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/profile-view"] = {
    source: "index.html#profileView",
    ids: [
        "profileAddress",
        "profileDepartment",
        "profileEmail",
        "profileEmergencyContact",
        "profileFullName",
        "profileGender",
        "profileLocalGuardian",
        "profileName",
        "profileNationality",
        "profilePhone",
        "profilePhotoIcon",
        "profilePhotoImage",
        "profileSchool",
        "profileSemester",
        "profileStudentId",
        "profileStudentIdDetail",
        "profileView",
        "profileYear"
    ],
    handlers: [
        "editProfile",
        "openMemberDigitalCard"
    ]
  };
}());
