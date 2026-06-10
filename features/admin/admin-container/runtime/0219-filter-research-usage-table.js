// Runtime slice from admin.js: filterResearchUsageTable.
function filterResearchUsageTable() {
    const container = document.getElementById('researchUsageTable');
    if (!container) return;
    const query = String(document.getElementById('researchLogSearch')?.value || '').toLowerCase();
    const mode = String(document.getElementById('researchLogMode')?.value || '').toLowerCase();
    const filtered = lastDashboardDetailRows.filter(row => {
        const haystack = [row.username, row.user_id, row.role, row.question, row.answer, row.model, row.mode].join(' ').toLowerCase();
        const rowMode = String(row.mode || '').toLowerCase();
        return (!query || haystack.includes(query)) && (!mode || rowMode === mode);
    });
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-sm">
                <thead><tr><th>Date</th><th>User</th><th>Mode</th><th>Question</th><th>Answer</th><th>Model</th></tr></thead>
                <tbody>
                    ${filtered.slice(0, 150).map(row => `
                        <tr>
                            <td>${formatCell(row.created_at || row.createdAt || '', 'created_at')}</td>
                            <td>${escapeAdminText(row.username || row.user_id || 'Unknown')}</td>
                            <td>${escapeAdminText(row.mode || '')}</td>
                            <td>${escapeAdminText(String(row.question || '').slice(0, 180))}</td>
                            <td>${escapeAdminText(String(row.answer || '').slice(0, 220))}</td>
                            <td>${escapeAdminText(row.model || '')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
