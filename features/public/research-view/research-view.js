// Feature: public/research-view
// Source: index.html#researchView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/research-view"] = {
    source: "index.html#researchView",
    ids: [
        "researchAudioUpload",
        "researchHistory",
        "researchMode",
        "researchPhotoName",
        "researchPhotoPreview",
        "researchPhotoPreviewImage",
        "researchPhotoUpload",
        "researchQuestion",
        "researchRecordBtn",
        "researchResult",
        "researchRunBtn",
        "researchStatus",
        "researchView"
    ],
    handlers: [
        "clearResearchHistory",
        "clearResearchPhoto",
        "clearResearchResult",
        "exportLatestResearch",
        "handleResearchPhotoUpload",
        "runStudentResearch",
        "toggleResearchRecording"
    ]
  };
}());
