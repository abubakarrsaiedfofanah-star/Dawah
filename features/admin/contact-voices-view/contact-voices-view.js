// Feature: admin/contact-voices-view
// Source: admin.html#contactVoicesView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/contact-voices-view"] = {
    source: "admin.html#contactVoicesView",
    ids: [
        "adminAboutFeature1",
        "adminAboutFeature2",
        "adminAboutFeature3",
        "adminAboutFeature4",
        "adminAboutHeading",
        "adminAboutParagraph1",
        "adminAboutParagraph2",
        "adminAboutTitle",
        "adminContactEmail",
        "adminContactHours",
        "adminContactLocation",
        "adminContactPhone",
        "adminContactVoiceMessagesList",
        "adminFinanceSignatureEmpty",
        "adminFinanceSignatureImage",
        "adminFinanceSignatureImageFile",
        "adminFinanceSignatureName",
        "adminFinanceSignaturePreview",
        "adminFinanceSignatureTitle",
        "adminSocialFacebook",
        "adminSocialInstagram",
        "adminSocialLinkedin",
        "adminSocialTiktok",
        "adminSocialWhatsapp",
        "adminSocialX",
        "adminSocialYoutube",
        "adminWhatWeDo1Text",
        "adminWhatWeDo1Title",
        "adminWhatWeDo2Text",
        "adminWhatWeDo2Title",
        "adminWhatWeDo3Text",
        "adminWhatWeDo3Title",
        "adminWhatWeDo4Text",
        "adminWhatWeDo4Title",
        "adminWhatWeDo5Text",
        "adminWhatWeDo5Title",
        "adminWhatWeDo6Text",
        "adminWhatWeDo6Title",
        "adminWhatWeDoTitle",
        "contactVoicesView"
    ],
    handlers: [
        "loadAdminContactVoiceMessages",
        "loadAdminSiteSettings",
        "removeFinanceSignatureImage",
        "saveAdminSiteSettings"
    ]
  };
}());
