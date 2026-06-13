// Runtime slice from daawah.js: applyPublicSiteSettings.
function applyPublicSiteSettings(settings = {}) {
    const merged = { ...getLocalSiteSettings(), ...settings };
    merged.contact_email = normalizeContactEmail(merged.contact_email);
    applyPublicPageContent(merged);
    setTextById('publicContactLocation', merged.contact_location);
    setContactLinkById('publicContactPhone', merged.contact_phone, 'tel:');
    setContactLinkById('publicContactEmail', merged.contact_email, 'mailto:');
    setTextById('publicContactHours', merged.contact_hours);
    setTextById('footerContactLocation', merged.contact_location);
    setContactLinkById('footerContactPhone', merged.contact_phone, 'tel:');
    setContactLinkById('footerContactEmail', merged.contact_email, 'mailto:');
    setTextById('footerContactHours', merged.contact_hours);

    const whatsapp = document.getElementById('publicContactWhatsapp');
    if (whatsapp) {
        whatsapp.href = merged.social_whatsapp || '#contact';
        whatsapp.textContent = whatsappLabel(merged.social_whatsapp, merged.contact_phone);
        whatsapp.closest('.contact-item')?.classList.toggle('d-none', !merged.social_whatsapp);
    }
    const footerWhatsapp = document.getElementById('footerContactWhatsapp');
    if (footerWhatsapp) {
        footerWhatsapp.href = merged.social_whatsapp || '#contact';
        footerWhatsapp.textContent = whatsappLabel(merged.social_whatsapp, merged.contact_phone);
    }
    renderPublicSocialLinks(merged);
    applyPortalAccessRules();
}
