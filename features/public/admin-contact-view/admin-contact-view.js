// Feature: public/admin-contact-view
// Source: index.html#adminContactView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/admin-contact-view"] = {
    source: "index.html#adminContactView",
    ids: [
        "adminContactView",
        "contactEmail",
        "contactFacebook",
        "contactHours",
        "contactInstagram",
        "contactLinkedin",
        "contactLocation",
        "contactPhone",
        "contactTiktok",
        "contactVoiceMessagesList",
        "contactWhatsapp",
        "contactX",
        "contactYoutube",
        "displayEmail",
        "displayHours",
        "displayLocation",
        "displayPhone"
    ],
    handlers: [
        "loadContactVoiceMessages",
        "saveContactAndSocialInfo",
        "updateContactInfo"
    ]
  };
}());
