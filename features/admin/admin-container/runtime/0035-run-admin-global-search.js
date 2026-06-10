// Runtime slice from admin.js: runAdminGlobalSearch.
function runAdminGlobalSearch() {
    const query = normalizeAdminText(document.getElementById('adminGlobalSearchInput')?.value || '');
    const container = document.getElementById('adminGlobalSearchResults');
    if (!container) return;
    if (!query) {
        container.innerHTML = '';
        return;
    }
    const sources = [
        ['Students', getStudentRecords()],
        ['Paid Members', getMemberRecords()],
        ['Payments', readStore('payments')],
        ['Donations', readStore('donations')],
        ['Welfare', readStore('welfareRequests')],
        ['Events', readStore('adminEvents')],
        ['Research', lastDashboardDetailType === 'research' ? lastDashboardDetailRows : []],
        ['Audit', readStore('adminActivityLogs')]
    ];
    const matches = sources.flatMap(([label, rows]) => (rows || [])
        .filter(row => normalizeAdminText(JSON.stringify(row)).includes(query))
        .slice(0, 8)
        .map(row => ({ label, row })))
        .slice(0, 40);
    container.innerHTML = `
        <div class="alert alert-info">
            <div class="d-flex justify-content-between align-items-center">
                <strong>Search results for "${escapeAdminText(query)}"</strong>
                <button class="btn btn-sm btn-outline-secondary" type="button" onclick="document.getElementById('adminGlobalSearchResults').innerHTML=''">Close</button>
            </div>
            ${matches.length ? `<div class="table-responsive mt-2"><table class="table table-sm mb-0"><tbody>${matches.map(item => `
                <tr><td><span class="badge bg-primary">${escapeAdminText(item.label)}</span></td><td>${escapeAdminText(JSON.stringify(item.row).slice(0, 220))}</td></tr>
            `).join('')}</tbody></table></div>` : '<p class="mb-0 mt-2">No matching records found.</p>'}
        </div>
    `;
}
