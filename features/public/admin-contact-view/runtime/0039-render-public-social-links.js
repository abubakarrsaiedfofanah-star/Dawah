// Runtime slice from daawah.js: renderPublicSocialLinks.
function renderPublicSocialLinks(settings) {
    const container = document.getElementById('publicSocialLinks');
    if (!container) return;
    const links = [
        ['social_whatsapp', 'WhatsApp', 'fab fa-whatsapp'],
        ['contact_email', 'Email', 'fas fa-envelope', value => `mailto:${value}`],
        ['social_facebook', 'Facebook', 'fab fa-facebook'],
        ['social_x', 'X', 'fab fa-twitter'],
        ['social_instagram', 'Instagram', 'fab fa-instagram'],
        ['social_youtube', 'YouTube', 'fab fa-youtube'],
        ['social_tiktok', 'TikTok', 'fab fa-tiktok'],
        ['social_linkedin', 'LinkedIn', 'fab fa-linkedin']
    ];
    container.innerHTML = links
        .filter(([key]) => settings[key])
        .map(([key, label, icon, hrefBuilder]) => {
            const href = hrefBuilder ? hrefBuilder(settings[key]) : settings[key];
            const targetAttrs = key === 'contact_email' ? '' : ' target="_blank" rel="noopener"';
            return `<a href="${escapeHtml(href)}"${targetAttrs} aria-label="${escapeHtml(label)}"><i class="${icon}"></i></a>`;
        })
        .join('');
}
