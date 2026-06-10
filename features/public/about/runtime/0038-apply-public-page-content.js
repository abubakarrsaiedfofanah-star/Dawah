// Runtime slice from daawah.js: applyPublicPageContent.
function applyPublicPageContent(settings = {}) {
    const textMap = {
        publicAboutTitle: settings.about_title,
        publicAboutHeading: settings.about_heading,
        publicAboutParagraph1: settings.about_paragraph_1,
        publicAboutParagraph2: settings.about_paragraph_2,
        publicAboutFeature1: settings.about_feature_1,
        publicAboutFeature2: settings.about_feature_2,
        publicAboutFeature3: settings.about_feature_3,
        publicAboutFeature4: settings.about_feature_4,
        publicWhatWeDoTitle: settings.what_we_do_title,
        publicWhatWeDo1Title: settings.what_we_do_1_title,
        publicWhatWeDo1Text: settings.what_we_do_1_text,
        publicWhatWeDo2Title: settings.what_we_do_2_title,
        publicWhatWeDo2Text: settings.what_we_do_2_text,
        publicWhatWeDo3Title: settings.what_we_do_3_title,
        publicWhatWeDo3Text: settings.what_we_do_3_text,
        publicWhatWeDo4Title: settings.what_we_do_4_title,
        publicWhatWeDo4Text: settings.what_we_do_4_text,
        publicWhatWeDo5Title: settings.what_we_do_5_title,
        publicWhatWeDo5Text: settings.what_we_do_5_text,
        publicWhatWeDo6Title: settings.what_we_do_6_title,
        publicWhatWeDo6Text: settings.what_we_do_6_text
    };
    Object.entries(textMap).forEach(([id, value]) => setTextById(id, value));
}
