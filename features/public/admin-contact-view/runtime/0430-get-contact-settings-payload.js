// Runtime slice from daawah.js: getContactSettingsPayload.
function getContactSettingsPayload() {
    return {
        contact_location: document.getElementById('contactLocation')?.value.trim() || '',
        contact_phone: document.getElementById('contactPhone')?.value.trim() || '',
        contact_email: document.getElementById('contactEmail')?.value.trim() || '',
        contact_hours: document.getElementById('contactHours')?.value.trim() || '',
        social_whatsapp: document.getElementById('contactWhatsapp')?.value.trim() || '',
        social_facebook: document.getElementById('contactFacebook')?.value.trim() || '',
        social_x: document.getElementById('contactX')?.value.trim() || '',
        social_instagram: document.getElementById('contactInstagram')?.value.trim() || '',
        social_youtube: document.getElementById('contactYoutube')?.value.trim() || '',
        social_tiktok: document.getElementById('contactTiktok')?.value.trim() || '',
        social_linkedin: document.getElementById('contactLinkedin')?.value.trim() || ''
    };
}
