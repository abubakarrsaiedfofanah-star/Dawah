// Runtime slice from daawah.js: renderPublicSocialLinks.
function renderPublicSocialLinks(settings) {
    const container = document.getElementById('publicSocialLinks');
    if (!container) return;
    const links = [
        ['social_whatsapp', 'WhatsApp', 'WA'],
        ['contact_email', 'Email', 'Email', value => `mailto:${value}`],
        ['social_facebook', 'Facebook', 'f'],
        ['social_x', 'X', 'X'],
        ['social_instagram', 'Instagram', 'IG'],
        ['social_youtube', 'YouTube', 'YT'],
        ['social_tiktok', 'TikTok', 'TT'],
        ['social_linkedin', 'LinkedIn', 'in']
    ];
    container.innerHTML = links
        .filter(([key]) => settings[key])
        .map(([key, label, mark, hrefBuilder]) => {
            const href = hrefBuilder ? hrefBuilder(settings[key]) : settings[key];
            const targetAttrs = key === 'contact_email' ? '' : ' target="_blank" rel="noopener"';
            return `<a href="${escapeHtml(href)}"${targetAttrs} aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}"><span class="social-link-mark" aria-hidden="true">${mark}</span><span class="social-link-label">${escapeHtml(label)}</span></a>`;
        })
        .join('');
}
