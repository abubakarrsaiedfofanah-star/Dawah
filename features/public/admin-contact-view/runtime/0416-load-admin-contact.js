// Runtime slice from daawah.js: loadAdminContact.
function loadAdminContact() {
    const applySettings = settings => {
        const merged = { ...getLocalSiteSettings(), ...(settings || {}) };
        document.getElementById('contactLocation').value = merged.contact_location || '';
        document.getElementById('contactPhone').value = merged.contact_phone || '';
        document.getElementById('contactEmail').value = merged.contact_email || '';
        document.getElementById('contactHours').value = merged.contact_hours || '';
        document.getElementById('contactWhatsapp').value = merged.social_whatsapp || '';
        document.getElementById('contactFacebook').value = merged.social_facebook || '';
        document.getElementById('contactX').value = merged.social_x || '';
        document.getElementById('contactInstagram').value = merged.social_instagram || '';
        document.getElementById('contactYoutube').value = merged.social_youtube || '';
        document.getElementById('contactTiktok').value = merged.social_tiktok || '';
        document.getElementById('contactLinkedin').value = merged.social_linkedin || '';
        document.getElementById('displayLocation').textContent = merged.contact_location || '-';
        document.getElementById('displayPhone').textContent = merged.contact_phone || '-';
        document.getElementById('displayEmail').textContent = merged.contact_email || '-';
        document.getElementById('displayHours').textContent = merged.contact_hours || '-';
    };

    const request = frontendOnly
        ? Promise.resolve(getStaticApiData('getSiteSettings'))
        : fetch('firestore-disabled-endpoint?action=getSiteSettings').then(response => parseJsonResponse(response));

    request
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Could not load contact settings');
            writeLocalSiteSettings(result.data || {});
            applySettings(result.data || {});
        })
        .catch(() => applySettings(getLocalSiteSettings()));
    loadContactVoiceMessages();
}
