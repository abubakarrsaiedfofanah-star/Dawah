// Runtime slice from daawah.js: renderResearchSources.
function renderResearchSources(sources) {
    if (!sources.length) return '';
    return `
        <hr>
        <h6>Sources</h6>
        <div class="research-source-grid">
            ${sources.map((source, index) => `
                <a class="research-source-card" href="${escapeHtml(source.url)}" target="_blank" rel="noopener">
                    <span class="research-source-card__index">${index + 1}</span>
                    <span>
                        <strong>${escapeHtml(source.title || formatSourceHost(source.url))}</strong>
                        <small>${escapeHtml(formatSourceHost(source.url))}</small>
                    </span>
                    <i class="fas fa-arrow-up-right-from-square"></i>
                </a>
            `).join('')}
        </div>
    `;
}
