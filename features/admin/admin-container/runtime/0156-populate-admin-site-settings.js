// Runtime slice from admin.js: populateAdminSiteSettings.
function populateAdminSiteSettings(settings = {}) {
    setAdminSettingsValue('adminContactLocation', settings.contact_location);
    setAdminSettingsValue('adminContactPhone', settings.contact_phone);
    setAdminSettingsValue('adminContactEmail', settings.contact_email);
    setAdminSettingsValue('adminContactHours', settings.contact_hours);
    setAdminSettingsValue('adminAboutTitle', settings.about_title);
    setAdminSettingsValue('adminAboutHeading', settings.about_heading);
    setAdminSettingsValue('adminAboutParagraph1', settings.about_paragraph_1);
    setAdminSettingsValue('adminAboutParagraph2', settings.about_paragraph_2);
    setAdminSettingsValue('adminAboutFeature1', settings.about_feature_1);
    setAdminSettingsValue('adminAboutFeature2', settings.about_feature_2);
    setAdminSettingsValue('adminAboutFeature3', settings.about_feature_3);
    setAdminSettingsValue('adminAboutFeature4', settings.about_feature_4);
    setAdminSettingsValue('adminWhatWeDoTitle', settings.what_we_do_title);
    [1, 2, 3, 4, 5, 6].forEach(index => {
        setAdminSettingsValue(`adminWhatWeDo${index}Title`, settings[`what_we_do_${index}_title`]);
        setAdminSettingsValue(`adminWhatWeDo${index}Text`, settings[`what_we_do_${index}_text`]);
    });
    setAdminSettingsValue('adminSocialWhatsapp', settings.social_whatsapp);
    setAdminSettingsValue('adminSocialFacebook', settings.social_facebook);
    setAdminSettingsValue('adminSocialX', settings.social_x);
    setAdminSettingsValue('adminSocialInstagram', settings.social_instagram);
    setAdminSettingsValue('adminSocialYoutube', settings.social_youtube);
    setAdminSettingsValue('adminSocialTiktok', settings.social_tiktok);
    setAdminSettingsValue('adminSocialLinkedin', settings.social_linkedin);
    setAdminSettingsValue('adminFinanceSignatureName', settings.finance_signature_name);
    setAdminSettingsValue('adminFinanceSignatureTitle', settings.finance_signature_title);
    setAdminSettingsValue('adminFinanceSignatureImage', settings.finance_signature_image);
    updateFinanceSignaturePreview(settings.finance_signature_image || '');
    setFinanceSignatureAccess();
}

function setFinanceSignatureAccess() {
    const allowed = Boolean(currentAdmin?.isMainAdmin);
    [
        'adminFinanceSignatureName',
        'adminFinanceSignatureTitle',
        'adminFinanceSignatureImageFile'
    ].forEach(id => {
        const control = document.getElementById(id);
        if (control) control.disabled = !allowed;
    });
    const removeButton = document.querySelector('button[onclick="removeFinanceSignatureImage()"]');
    if (removeButton) removeButton.disabled = !allowed;
    const imageControl = document.getElementById('adminFinanceSignatureImageFile');
    if (!imageControl) return;
    let note = document.getElementById('financeSignatureAccessNote');
    if (!note) {
        note = document.createElement('small');
        note.id = 'financeSignatureAccessNote';
        note.className = 'd-block mt-2 text-muted';
        imageControl.closest('.col-md-6')?.appendChild(note);
    }
    if (note) note.textContent = allowed
        ? 'Only the main admin can set the official Imam name and signature.'
        : 'Official Imam signature controls are locked. Ask the main admin to update them.';
}
